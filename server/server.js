const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload with file type validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept all image types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  // Other allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, Word documents, Excel files, and text files are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Google Drive API setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', async (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Add version control tracking
const fileVersions = new Map();
const fileMetadata = new Map();

// Helper function to generate version metadata
const generateVersionMetadata = (file, userId) => {
  // Read file content synchronously for hashing
  const fileContent = fs.readFileSync(file.path);
  return {
    version: fileVersions.get(file.originalname)?.length || 0,
    timestamp: new Date().toISOString(),
    userId,
    size: file.size,
    mimeType: file.mimetype,
    hash: require('crypto').createHash('md5').update(fileContent).digest('hex')
  };
};

// Add AI-powered version description generation
const generateVersionDescription = (oldVersion, newVersion) => {
  const changes = [];
  if (oldVersion?.size !== newVersion.size) {
    changes.push(`File size changed from ${oldVersion?.size || 'N/A'} to ${newVersion.size}`);
  }
  if (oldVersion?.mimeType !== newVersion.mimeType) {
    changes.push(`File type changed from ${oldVersion?.mimeType || 'N/A'} to ${newVersion.mimeType}`);
  }
  return changes.join(', ') || 'File updated';
};

// Modify upload endpoint to handle versioning
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ensure the file was saved properly
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({ error: 'File was not saved properly' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const mimeType = req.file.mimetype;

    // Handle versioning
    if (!fileVersions.has(req.file.originalname)) {
      fileVersions.set(req.file.originalname, []);
    }
    
    const versions = fileVersions.get(req.file.originalname);
    const newVersion = {
      version: versions.length,
      timestamp: new Date().toISOString(),
      userId: req.body.userId,
      size: req.file.size,
      mimeType: req.file.mimetype,
      path: filePath
    };
    
    versions.push(newVersion);

    // Store file metadata
    fileMetadata.set(fileName, {
      originalName: req.file.originalname,
      versions: versions,
      lastModified: new Date().toISOString(),
      accessCount: 0
    });

    // Log successful upload
    console.log('File uploaded successfully:', {
      path: filePath,
      name: fileName,
      type: mimeType
    });

    res.json({
      message: 'File uploaded successfully',
      localPath: filePath,
      fileName: fileName,
      mimeType: mimeType,
      version: newVersion.version,
      versionInfo: newVersion
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: error.message || 'Error uploading file',
      details: error.response?.data || {}
    });
  }
});

// Add endpoint to get file version history
app.get('/file-versions/:fileName', (req, res) => {
  const metadata = fileMetadata.get(req.params.fileName);
  if (!metadata) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Update access count
  metadata.accessCount++;
  fileMetadata.set(req.params.fileName, metadata);
  
  res.json({
    originalName: metadata.originalName,
    versions: metadata.versions,
    lastModified: metadata.lastModified,
    accessCount: metadata.accessCount
  });
});

// Add endpoint to restore previous version
app.post('/restore-version', async (req, res) => {
  const { fileName, version } = req.body;
  const metadata = fileMetadata.get(fileName);
  
  if (!metadata || version >= metadata.versions.length) {
    return res.status(404).json({ error: 'Version not found' });
  }

  try {
    const targetVersion = metadata.versions[version];
    // Implement version restoration logic here
    res.json({
      message: 'Version restored successfully',
      version: targetVersion
    });
  } catch (error) {
    res.status(500).json({ error: 'Error restoring version' });
  }
});

// Add MIME type mapping function
const getMimeType = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

// Add file tracking with both path and drive link
const convertedFiles = new Map();

// Optimize Drive upload function
const uploadToDrive = async (filePath, fileName, mimeType) => {
  const media = {
    mimeType: mimeType,
    body: fs.createReadStream(filePath)
  };

  const requestBody = {
    name: fileName,
    mimeType: mimeType,
  };

  // Create file with optimized settings
  const response = await drive.files.create({
    requestBody,
    media,
    fields: 'id',
    supportsAllDrives: false,
    uploadType: 'media'
  });

  // Set permissions in parallel with getting the web link
  const [_, result] = await Promise.all([
    drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      fields: 'id'
    }),
    drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink',
    })
  ]);

  return result.data.webViewLink;
};

// Convert to Google Drive endpoint
app.post('/convert-to-drive', async (req, res) => {
  try {
    const { filePath, fileName } = req.body;

    if (!filePath || !fileName) {
      return res.status(400).json({ error: 'File path and name are required' });
    }

    // Quick cache check
    const cachedLink = convertedFiles.get(filePath);
    if (cachedLink) {
      return res.json({
        message: 'File already converted to Google Drive link',
        driveLink: cachedLink
      });
    }

    // Single fs check
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const mimeType = getMimeType(fileName);
    
    // Upload and get link
    const driveLink = await uploadToDrive(filePath, fileName, mimeType);
    
    // Cache the result
    convertedFiles.set(filePath, driveLink);

    // Clean up file
    try {
      fs.unlinkSync(filePath);
    } catch (deleteError) {
      console.warn('Could not delete file:', deleteError.message);
    }

    return res.json({
      message: 'File converted to Google Drive link successfully',
      driveLink: driveLink
    });
  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).json({ 
      error: error.message || 'Error converting file',
      details: error.response?.data || {}
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 