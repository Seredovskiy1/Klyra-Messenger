# Klyra Desktop Client Configuration

## Configuration File

The client uses `src/config.json` for configuration. Copy `src/config.example.json` to `src/config.json` and modify as needed.

## Configuration Options

### Server Settings
```json
{
  "server": {
    "host": "localhost",          // Server hostname or IP
    "port": 3001,                 // Server port
    "protocol": "http",           // Protocol: http or https
    "autoReconnect": true,        // Enable auto-reconnection
    "reconnectAttempts": 5,       // Max reconnection attempts
    "reconnectInterval": 1000     // Reconnection interval in ms
  }
}
```

### UI Settings
```json
{
  "ui": {
    "theme": "auto",              // Theme: auto, light, dark
    "soundEnabled": true,         // Enable sound notifications
    "soundVolume": 0.2,           // Sound volume (0.0 - 1.0)
    "showTimestamps": true,       // Show message timestamps
    "showAvatars": true           // Show user avatars
  }
}
```

### Feature Settings
```json
{
  "features": {
    "fileSharing": true,          // Enable file sharing
    "messageEditing": true,       // Enable message editing
    "messageDeletion": true,      // Enable message deletion
    "typingIndicators": true,     // Enable typing indicators
    "messageSearch": true         // Enable message search
  }
}
```

### Limits
```json
{
  "limits": {
    "maxFileSize": 10485760,      // Max file size in bytes (10MB)
    "maxMessageLength": 1000,     // Max message length
    "maxMessagesInHistory": 100   // Max messages to keep in history
  }
}
```

## Connecting to Remote Server

### For Production Server:

1. **Update config.json:**
```json
{
  "server": {
    "host": "yourdomain.com",
    "port": 3001,
    "protocol": "https",
    "autoReconnect": true,
    "reconnectAttempts": 10,
    "reconnectInterval": 2000
  }
}
```

2. **For IP address:**
```json
{
  "server": {
    "host": "192.168.1.100",
    "port": 3001,
    "protocol": "http",
    "autoReconnect": true,
    "reconnectAttempts": 5,
    "reconnectInterval": 1000
  }
}
```

3. **For local network:**
```json
{
  "server": {
    "host": "192.168.1.50",
    "port": 3001,
    "protocol": "http",
    "autoReconnect": true,
    "reconnectAttempts": 5,
    "reconnectInterval": 1000
  }
}
```

## Building for Distribution

### Development Build:
```cmd
cargo tauri dev
```

### Production Build:
```cmd
cargo tauri build
```

### Cross-platform Build:
```cmd
# Windows
cargo tauri build --target x86_64-pc-windows-msvc

# Linux
cargo tauri build --target x86_64-unknown-linux-gnu

# macOS
cargo tauri build --target x86_64-apple-darwin
```

## Configuration Examples

### Local Development:
```json
{
  "server": {
    "host": "localhost",
    "port": 3001,
    "protocol": "http"
  }
}
```

### Production with HTTPS:
```json
{
  "server": {
    "host": "chat.yourdomain.com",
    "port": 443,
    "protocol": "https"
  }
}
```

### Custom Port:
```json
{
  "server": {
    "host": "yourdomain.com",
    "port": 8080,
    "protocol": "http"
  }
}
```

## Troubleshooting

### Connection Issues:
1. Check if server is running
2. Verify host and port in config.json
3. Check firewall settings
4. Ensure server allows CORS from your domain

### Build Issues:
1. Make sure Rust and Tauri CLI are installed
2. Check Node.js version (18+)
3. Run `npm install` before building

### Runtime Issues:
1. Check browser console for errors
2. Verify config.json syntax
3. Check network connectivity
