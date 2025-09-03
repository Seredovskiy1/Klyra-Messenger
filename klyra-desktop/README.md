# Klyra Desktop - Anonymous Secure Chat

A modern, cross-platform anonymous desktop chat application built with Tauri, React, and Rust. Designed for maximum privacy and security.

## Overview

Klyra Desktop is an anonymous chat application that prioritizes user privacy and security. Built with Rust backend and React frontend, wrapped in a native desktop experience using Tauri. The application provides a secure, anonymous chat experience with no data collection or tracking.

## 🔒 Privacy & Security Features

- **End-to-End Encryption**: All messages are encrypted with XOR cipher
- **No Data Storage**: Messages are not stored on server - only in memory
- **Auto-Delete**: Messages automatically disappear after 1 hour
- **Anonymous Files**: File metadata (name, size, type) is removed for anonymity
- **No Logging**: Zero server logs or activity tracking
- **No IP Tracking**: IP addresses are not stored or logged
- **Random Delays**: Traffic analysis prevention with random message delays
- **Nickname Changes**: Change your nickname anytime for additional anonymity
- **Data Clearing**: Clear all personal data while keeping app settings

## 💬 Chat Features

- **Real-time Chat**: Instant messaging with encrypted communication
- **File Sharing**: Anonymous file sharing without metadata
- **Message Editing**: Edit your messages with encryption
- **Message Deletion**: Delete your messages anytime
- **User Management**: Dynamic admin assignment (server creator becomes admin)
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

- **Backend**: Rust with Tauri (WebSocket server)
- **Frontend**: React 19 with Vite
- **Encryption**: XOR cipher for message encryption
- **UI Framework**: Custom CSS with modern design principles
- **Build Tool**: Tauri CLI
- **Package Manager**: npm/Cargo
- **Cross-platform**: Windows, macOS, and Linux support

## Prerequisites

- **Rust**: Latest stable version (1.70+)
- **Tauri CLI**: Install via `cargo install tauri-cli`
- **Node.js**: Version 18+ (for frontend development)
- **npm**: For managing frontend dependencies

## 🚀 Quick Start

### Option 1: Create Your Own Server
1. **Start the application**
2. **Click "Create Server"**
3. **Enter server name and port**
4. **Share connection details with others**

### Option 2: Connect to Existing Server
1. **Start the application**
2. **Click "Connect to Server"**
3. **Enter server IP and port**
4. **Start chatting anonymously**

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/klyra-desktop.git
   cd klyra-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   cargo tauri dev
   ```

## 🔧 Development

### Development Mode
```bash
cargo tauri dev
```
This command starts the development server and opens the application in development mode with hot reload.

### Building for Production
```bash
cargo tauri build
```
This creates optimized production builds for your target platform.

### Frontend Development
```bash
npm run dev
```
Run only the frontend development server without Tauri.

## 📁 Project Structure

```
klyra-desktop/
├── src/                    # React frontend source code
│   ├── components/         # React components
│   │   ├── ChatClient.jsx  # Main chat interface with encryption
│   │   ├── AuthWindow.jsx  # Server creation/connection
│   │   ├── SettingsMenu.jsx # Settings and nickname management
│   │   └── CustomTitleBar.jsx # Custom window controls
│   ├── assets/            # Static assets and images
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── src-tauri/             # Rust backend and Tauri configuration
│   ├── src/               # Rust source code
│   │   └── main.rs        # WebSocket server with anonymity features
│   ├── tauri.conf.json    # Tauri application configuration
│   ├── Cargo.toml         # Rust dependencies
│   └── icons/             # Application icons
├── public/                 # Public static files
├── index.html              # HTML entry point
└── package.json            # Node.js dependencies
```

## ⚙️ Configuration

### Tauri Configuration
The main Tauri configuration is located in `src-tauri/tauri.conf.json`. Key settings include:
- Window properties (1200x900, decorations, resizable)
- Application metadata (name, version, identifier)
- Security policies and permissions

### Rust Configuration
Rust dependencies and build settings are managed in `src-tauri/Cargo.toml`.

### Privacy Settings
- **Theme**: Automatically saved in localStorage
- **Personal Data**: Automatically cleared (except app settings)
- **Messages**: Auto-deleted after 1 hour
- **Files**: Anonymous names (file_timestamp.bin)

## 🏗️ Building and Distribution

### Local Build
```bash
cargo tauri build
```

### Cross-platform Build
```bash
cargo tauri build --target x86_64-pc-windows-msvc  # Windows
cargo tauri build --target x86_64-apple-darwin      # macOS
cargo tauri build --target x86_64-unknown-linux-gnu # Linux
```

## 🔐 Security & Privacy

### What We Protect
- **Message Content**: End-to-end encrypted
- **User Identity**: No persistent user IDs
- **File Metadata**: Removed for anonymity
- **Network Traffic**: Random delays prevent analysis
- **Server Logs**: Completely disabled
- **IP Addresses**: Not stored or tracked

### What We Store
- **Theme Settings**: Only UI preferences
- **Session Data**: Only in memory (auto-deleted)

### What We Don't Store
- **Message History**: Never saved
- **User Information**: No persistent data
- **File Information**: No metadata
- **Connection Logs**: No tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Privacy-First Development
When contributing, please ensure:
- No data collection or tracking
- Maintain anonymity features
- Preserve encryption functionality
- Keep zero-logging policy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/klyrac/klyra-desktop?tab=Apache-2.0-1-ov-file) file for details.

## 🆘 Support

If you encounter any issues or have questions:
- Check the [Issues](https://github.com/klyrac/klyra-desktop/issues) page
- Create a new issue with detailed information
- Contact the development team

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Privacy-focused design principles
- Anonymous communication protocols
- Icons and assets created specifically for Klyra Desktop

---

**⚠️ Important**: This application is designed for anonymous communication. Use responsibly and in accordance with local laws and regulations.