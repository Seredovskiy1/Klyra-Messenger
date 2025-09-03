# Klyra Server Configuration

## Configuration File

The server uses `config.json` for configuration. Copy `config.example.json` to `config.json` and modify as needed.

## Configuration Options

### Server Settings
```json
{
  "server": {
    "port": 3001,           // Server port
    "host": "0.0.0.0",      // Server host (0.0.0.0 for all interfaces)
    "cors": {
      "origin": "*",        // CORS origin (use specific domain in production)
      "methods": ["GET", "POST"]
    }
  }
}
```

### Database Settings
```json
{
  "database": {
    "type": "memory",       // Currently only "memory" is supported
    "persist": false        // Whether to persist data (not implemented yet)
  }
}
```

### Room Settings
```json
{
  "rooms": {
    "defaultRoom": "general",     // Default room name
    "maxUsersPerRoom": 100,       // Maximum users per room
    "maxMessagesPerRoom": 1000    // Maximum messages to keep in memory
  }
}
```

### Security Settings
```json
{
  "security": {
    "maxFileSize": 10485760,      // Maximum file size in bytes (10MB)
    "allowedFileTypes": ["*"],    // Allowed file types (* for all)
    "rateLimit": {
      "messages": 30,             // Messages per window
      "windowMs": 60000           // Window in milliseconds (1 minute)
    }
  }
}
```

### Logging Settings
```json
{
  "logging": {
    "level": "info",              // Log level: error, warn, info, debug
    "logConnections": true,       // Log user connections
    "logMessages": false          // Log messages (privacy concern)
  }
}
```

## Environment Variables

You can override configuration using environment variables:

- `PORT` - Server port
- `HOST` - Server host

Example:
```bash
PORT=8080 HOST=0.0.0.0 npm start
```

## Production Deployment

### For VPS/Linux Server:

1. **Update config.json:**
```json
{
  "server": {
    "port": 3001,
    "host": "0.0.0.0",
    "cors": {
      "origin": "https://yourdomain.com",
      "methods": ["GET", "POST"]
    }
  }
}
```

2. **Use PM2 for process management:**
```bash
npm install -g pm2
pm2 start server.js --name klyra-server
pm2 save
pm2 startup
```

3. **Use Nginx as reverse proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable HTTPS with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/rooms` - List all rooms
- `GET /api/room/:roomId/users` - Get users in a room
- `GET /api/room/:roomId/messages` - Get messages from a room
- `GET /api/debug/users` - Debug: see current users
