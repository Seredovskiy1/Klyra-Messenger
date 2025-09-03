# Klyra Messenger

A modern, cross-platform chat application with separate client and server components.

## Project Structure

```
Klyra-Messenger/
├── klyra-desktop/          # Desktop client (Tauri + React)
└── klyra-server/           # Node.js server
```

## Quick Start

### 1. Configure Server
```cmd
cd klyra-server
cp config.example.json config.json
# Edit config.json if needed
npm install
npm start
```

### 2. Configure Client
```cmd
cd klyra-desktop
cp src/config.example.json src/config.json
# Edit src/config.json if needed
npm install
cargo tauri dev
```

## Configuration

Both server and client support configuration files:

- **Server**: `klyra-server/config.json` - See [Server Config](klyra-server/CONFIG.md)
- **Client**: `klyra-desktop/src/config.json` - See [Client Config](klyra-desktop/CONFIG.md)

### For Remote Server:
1. Update server config with your domain/IP
2. Update client config to connect to your server
3. Deploy server to VPS/Linux

## Features

- Real-time messaging
- File sharing
- Message editing and deletion
- User presence
- Sound notifications
- Modern UI with theme support
- Cross-platform support

## Technology Stack

- **Client**: Tauri + React + Vite
- **Server**: Node.js + Express + Socket.io
- **Languages**: Rust, JavaScript, HTML, CSS

## Documentation

- [Client Documentation](klyra-desktop/README.md)
- [Server Documentation](klyra-server/README.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.