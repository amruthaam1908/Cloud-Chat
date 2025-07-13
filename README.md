# Cloud Chat - Mobile Phone Interface

A real-time chat application with file sharing and Google Drive integration, featuring a mobile phone-like interface design.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Mobile Phone Design**: Side-by-side sender and receiver screens that look like actual mobile phones
- **File Sharing**: Upload and share files with automatic Google Drive conversion
- **WhatsApp-style UI**: Modern chat interface with message bubbles and status indicators
- **Google Drive Integration**: Files are automatically converted to Google Drive links
- **Responsive Design**: Works on desktop and mobile devices

## 📱 Mobile Phone Interface

The application features two mobile phone screens side by side:
- **Sender's Phone**: Green-themed interface for sending messages
- **Receiver's Phone**: Dark green-themed interface for receiving messages
- **Realistic Design**: Black phone frames with rounded corners and phone notches
- **Compact Layout**: Optimized for mobile phone dimensions (320px × 600px)

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern UI framework
- **Material-UI**: Component library for consistent design
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Google APIs**: Google Drive integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cloud-chat
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=your_redirect_uri
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   ```

4. **Run the application**
   ```bash
   npm run dev-full
   ```

## 🎯 Usage

1. **Start the application**: The app will run on `http://localhost:3000`
2. **Send Messages**: Type messages in either phone interface
3. **Share Files**: Click the attachment icon to upload files
4. **View Files**: Files are automatically converted to Google Drive links
5. **Real-time Chat**: Messages appear instantly on both phones

## 📁 Project Structure

```
cloud-chat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js     # Main chat component
│   │   │   └── FileOrganizer.js
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   └── server.js           # Express server
├── uploads/                # File upload directory
├── scripts/                # Utility scripts
└── package.json            # Root package.json
```

## 🔧 Available Scripts

- `npm run dev-full`: Start both client and server concurrently
- `npm run server`: Start only the backend server
- `npm run client`: Start only the React frontend
- `npm run install-all`: Install dependencies for both client and server

## 🌟 Key Features

### File Sharing
- **Automatic Google Drive Conversion**: Files are instantly converted to Google Drive links
- **Clickable Links**: Direct access to files on Google Drive
- **Multiple File Types**: Support for images, PDFs, Word documents, Excel files
- **No Download Buttons**: Clean interface with direct Google Drive access

### Real-time Communication
- **Instant Messaging**: Real-time message delivery
- **Typing Indicators**: Shows when users are typing
- **Message Status**: Sent, delivered, and read indicators
- **Socket.IO Integration**: Reliable real-time communication

### Mobile-First Design
- **Phone-like Interface**: Realistic mobile phone appearance
- **Responsive Layout**: Adapts to different screen sizes
- **Touch-Friendly**: Optimized for mobile interaction
- **WhatsApp-style**: Familiar chat interface design

## 🔐 Environment Setup

To use Google Drive integration, you'll need to:

1. **Create a Google Cloud Project**
2. **Enable Google Drive API**
3. **Create OAuth 2.0 credentials**
4. **Generate a refresh token**
5. **Add credentials to `.env` file**

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository. 