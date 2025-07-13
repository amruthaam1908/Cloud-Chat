import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
  Link,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  AttachFile, 
  Send, 
  Image,
  Description,
  InsertDriveFile,
  PictureAsPdf,
  TableChart,
  DoneAll,
  Done,
  MoreVert
} from '@mui/icons-material';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return <Image />;
  if (mimeType?.includes('pdf')) return <PictureAsPdf />;
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return <TableChart />;
  if (mimeType?.includes('word') || mimeType?.includes('document')) return <Description />;
  return <InsertDriveFile />;
};

const getAvatarColor = (userId) => {
  const colors = ['#25D366', '#34B7F1', '#075E54', '#128C7E', '#FFA500'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const Chat = ({ userId, role }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [room] = useState('general');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const fileInputRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedFileVersions, setSelectedFileVersions] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.emit('join_room', room);

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, { ...data, status: 'delivered' }]);
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 1000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [room, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = () => {
    socket.emit('typing', { room, userId });
  };

  const handleSendMessage = async () => {
    if (message.trim() || selectedFile) {
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', userId);

        try {
          const response = await axios.post('http://localhost:5000/upload', formData);
          console.log('Upload response:', response.data);

          // Automatically convert to Google Drive link
          let driveLink = null;
          try {
            const driveResponse = await axios.post('http://localhost:5000/convert-to-drive', {
              fileName: response.data.fileName,
              filePath: response.data.localPath
            });
            driveLink = driveResponse.data.driveLink;
          } catch (driveError) {
            console.error('Error converting to Google Drive:', driveError);
          }

          const fileMessage = {
            room,
            type: 'file',
            content: message || 'Shared a file:',
            fileName: selectedFile.name,
            localPath: response.data.localPath,
            mimeType: selectedFile.type,
            converted: true,
            driveLink: driveLink,
            time: new Date().toLocaleTimeString(),
            senderId: userId,
            role: role,
            status: 'sent'
          };

          socket.emit('send_message', fileMessage);
          setSelectedFile(null);
          fileInputRef.current.value = '';
          setMessage('');
        } catch (error) {
          console.error('Upload error:', error);
          setError(error.response?.data?.error || 'Error uploading file');
        } finally {
          setUploading(false);
        }
      }

      if (message.trim()) {
        const messageData = {
          room,
          type: 'text',
          content: message,
          time: new Date().toLocaleTimeString(),
          senderId: userId,
          role: role,
          status: 'sent'
        };

        socket.emit('send_message', messageData);
        setMessage('');
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const isOwnMessage = (msgSenderId) => msgSenderId === userId;

  const getMessageStyle = (msg) => {
    const baseStyle = {
      maxWidth: '85%',
      borderRadius: '12px',
      p: 1.5,
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      wordWrap: 'break-word',
      '&:hover': {
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }
    };

    if (isOwnMessage(msg.senderId)) {
      return {
        ...baseStyle,
        bgcolor: '#DCF8C6', // WhatsApp own message color
        color: '#000',
        alignSelf: 'flex-end',
        borderBottomRightRadius: '4px',
      };
    } else {
      return {
        ...baseStyle,
        bgcolor: '#ffffff',
        color: '#000',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: '4px',
      };
    }
  };

  const MessageStatus = ({ status }) => {
    if (status === 'sent') return <Done sx={{ fontSize: 16, color: '#8e8e8e' }} />;
    if (status === 'delivered') return <DoneAll sx={{ fontSize: 16, color: '#8e8e8e' }} />;
    if (status === 'read') return <DoneAll sx={{ fontSize: 16, color: '#34B7F1' }} />;
    return null;
  };

  const VersionHistoryDialog = ({ open, onClose, fileVersions }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          <List>
          {fileVersions?.map((version, index) => (
            <ListItem key={index} divider>
                  <ListItemIcon>
                <Description />
                  </ListItemIcon>
                  <ListItemText
                primary={`Version ${version.version}`}
                secondary={`${new Date(version.timestamp).toLocaleString()} - ${version.size} bytes`}
                  />
                </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );

  const FileMessage = ({ msg }) => (
    <Box sx={{ minWidth: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
        bgcolor: 'rgba(0,0,0,0.05)',
            p: 1,
            borderRadius: 1
          }}>
            {getFileIcon(msg.mimeType)}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
            {msg.fileName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {msg.mimeType}
              </Typography>
            </Box>
          </Box>
      {msg.content && (
        <Typography sx={{ mb: 1 }}>{msg.content}</Typography>
      )}
      {msg.driveLink ? (
          <Link 
            href={msg.driveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#25D366',
            bgcolor: 'rgba(37, 211, 102, 0.1)',
              p: 1,
              borderRadius: 1,
            border: '1px solid rgba(37, 211, 102, 0.3)',
            textDecoration: 'none',
            display: 'block',
              '&:hover': {
              bgcolor: 'rgba(37, 211, 102, 0.2)',
                textDecoration: 'underline'
              }
            }}
          >
            {msg.driveLink}
          </Link>
      ) : (
        <Typography variant="caption" color="textSecondary">
          Converting to Google Drive...
        </Typography>
      )}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            gap: 0.5,
            mt: 0.5,
            opacity: 0.7
          }}>
            <Typography variant="caption">{msg.time}</Typography>
            {isOwnMessage(msg.senderId) && <MessageStatus status={msg.status} />}
          </Box>
    </Box>
  );

  return (
    <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
      bgcolor: '#f0f2f5'
    }}>
      {/* Header */}
        <Box sx={{ 
        p: 1.5, 
          bgcolor: role === 'receiver' ? 'secondary.main' : 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
        gap: 1.5,
        minHeight: '50px'
        }}>
          <Avatar 
            sx={{ 
              bgcolor: getAvatarColor(userId),
            width: 32,
            height: 32
            }}
          >
            {role[0].toUpperCase()}
          </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>
              {role === 'sender' ? 'Sending Messages' : 'Receiving Messages'}
            </Typography>
            {typing && (
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '11px' }}>
                typing...
              </Typography>
            )}
          </Box>
        <IconButton color="inherit" size="small" sx={{ p: 0.5 }}>
          <MoreVert sx={{ fontSize: 18 }} />
        </IconButton>
        </Box>
        
      {/* Messages Area */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
        px: 1.5, 
          py: 1,
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
        backgroundSize: '200px'
        }}>
          {messages.map((msg, index) => (
            <Box 
              key={index} 
              sx={{ 
              mb: 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage(msg.senderId) ? 'flex-end' : 'flex-start',
              }}
            >
              <Box sx={getMessageStyle(msg)}>
                {msg.type === 'text' ? (
                  <>
                  <Typography sx={{ wordBreak: 'break-word', fontSize: '14px' }}>{msg.content}</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      gap: 0.5,
                      mt: 0.5,
                      opacity: 0.7
                    }}>
                    <Typography variant="caption" sx={{ fontSize: '11px' }}>{msg.time}</Typography>
                      {isOwnMessage(msg.senderId) && <MessageStatus status={msg.status} />}
                    </Box>
                  </>
                ) : (
                  <FileMessage msg={msg} />
                )}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

      {/* Input Area */}
        <Box sx={{ 
          display: 'flex', 
        gap: 0.5, 
        p: 1.5, 
        bgcolor: '#f0f2f5',
        borderTop: '1px solid #e0e0e0'
        }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Tooltip title="Attach file">
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            size="small"
              sx={{ 
                bgcolor: 'white',
              p: 1,
                '&:hover': {
                  bgcolor: '#e3f2fd'
                }
              }}
            >
            {uploading ? <CircularProgress size={16} /> : <AttachFile sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
          {selectedFile && (
            <Chip
              label={selectedFile.name}
              onDelete={() => setSelectedFile(null)}
              size="small"
            sx={{ 
              ml: 0.5, 
              maxWidth: '100px',
              fontSize: '10px',
              height: '24px'
            }}
            />
          )}
          <TextField
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            onKeyUp={handleTyping}
            placeholder="Type a message"
            disabled={uploading}
            multiline
          maxRows={3}
            size="small"
            sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              fontSize: '14px',
              '& input': {
                fontSize: '14px'
              }
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={uploading}
          size="small"
            sx={{ 
              minWidth: 'auto',
              borderRadius: '50%',
            p: 1,
              bgcolor: role === 'sender' ? 'primary.main' : 'secondary.main',
              '&:hover': {
                bgcolor: role === 'sender' ? 'primary.dark' : 'secondary.dark'
              }
            }}
          >
          <Send sx={{ fontSize: 18 }} />
          </Button>
        </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <VersionHistoryDialog
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        fileVersions={selectedFileVersions}
      />
    </Box>
  );
};

export default Chat; 