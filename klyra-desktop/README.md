# Klyra Desktop - Modern Chat Messenger

A modern, cross-platform desktop chat application built with Tauri, React, and Node.js. Simple and clean messaging experience.

## Overview

Klyra Desktop is a chat application that provides a clean and modern messaging experience. Built with Rust backend and React frontend, wrapped in a native desktop experience using Tauri. The application connects to a separate Node.js server for real-time messaging.

## 💬 Chat Features

- **Real-time Chat**: Instant messaging with WebSocket communication
- **File Sharing**: Share files with other users
- **Message Editing**: Edit your messages after sending
- **Message Deletion**: Delete your messages anytime
- **User Management**: See online users and their status
- **Auto-Reconnection**: Automatic reconnection with exponential backoff
- **Sound Notifications**: Custom MP3 notifications (20% volume)
- **Message Search**: Search through current session messages

## 🎨 User Interface

### Modern UI/UX
- **Beautiful Design**: Gradient backgrounds with smooth animations
- **Theme Support**: Light and dark theme switching (settings preserved)
- **Custom Title Bar**: Native window controls with full functionality
- **Responsive Design**: Adapts to different screen sizes
- **Context Menus**: Right-click functionality for message actions

### Window Controls
- **Minimize**: Collapse window to taskbar
- **Maximize/Restore**: Toggle fullscreen mode
- **Close**: Exit application
- **Drag**: Move window by dragging anywhere on the title bar

### Keyboard Shortcuts
- **Ctrl+M** - Minimize window
- **Ctrl+F** - Maximize/Restore window  
- **Ctrl+W** - Close window

## 🛠️ Technology Stack

- **Backend**: Rust with Tauri (Desktop wrapper)
- **Frontend**: React 19 with Vite
- **Server**: Node.js with Express and Socket.io
- **UI Framework**: Custom CSS with modern design principles
- **Build Tool**: Tauri CLI
- **Package Manager**: npm/Cargo
- **Cross-platform**: Windows, macOS, and Linux support

## Prerequisites

- **Rust**: Latest stable version (1.70+)
- **Tauri CLI**: Install via `cargo install tauri-cli`
- **Node.js**: Version 18+ (for server)
- **npm**: For managing dependencies

## 🚀 Quick Start

### 1. Start the Server
First, start the Klyra server:
```cmd
cd klyra-server
npm install
npm start
```

### 2. Start the Client
Then, start the desktop application:
```cmd
cd klyra-desktop
npm install
cargo tauri dev
```

## 📦 Installation

1. **Clone the repository**
   ```cmd
   git clone https://github.com/your-username/klyra-messenger.git
   cd klyra-messenger
   ```

2. **Install server dependencies**
   ```cmd
   cd klyra-server
   npm install
   ```

3. **Install client dependencies**
   ```cmd
   cd ../klyra-desktop
   npm install
   ```

4. **Start the server**
   ```cmd
   cd ../klyra-server
   npm start
   ```

5. **Run the client in development mode**
   ```cmd
   cd ../klyra-desktop
   cargo tauri dev
   ```

## 🔧 Development

### Development Mode
```cmd
cargo tauri dev
```
This command starts the development server and opens the application in development mode with hot reload.

### Building for Production
```cmd
cargo tauri build
```
This creates optimized production builds for your target platform.

## 🏗️ Project Structure

```
Klyra-Messenger/
├── klyra-desktop/          # Desktop client (Tauri + React)
│   ├── src/
│   │   ├── components/     # React components
│   │   └── assets/         # Static assets
│   └── src-tauri/          # Rust backend
└── klyra-server/           # Node.js server
    ├── server.js           # Main server file
    └── package.json        # Server dependencies
```

## 🏗️ Building and Distribution

### Local Build
```cmd
cargo tauri build
```

### Cross-platform Build
```cmd
cargo tauri build --target x86_64-pc-windows-msvc  # Windows
cargo tauri build --target x86_64-apple-darwin      # macOS
cargo tauri build --target x86_64-unknown-linux-gnu # Linux
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/klyrac/klyra-desktop?tab=Apache-2.0-1-ov-file) file for details.

## 🆘 Support

If you encounter any issues or have questions:
- Check the [Issues](https://github.com/klyrac/klyra-desktop/issues) page
- Create a new issue with detailed information
- Contact the development team

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Modern design principles
- Real-time communication protocols
- Icons and assets created specifically for Klyra Desktop