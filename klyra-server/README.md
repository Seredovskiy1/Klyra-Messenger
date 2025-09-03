# Klyra Server

A simple WebSocket-based chat server for Klyra Messenger.

## Features

- Real-time messaging with Socket.io
- Multiple chat rooms
- File sharing
- Message editing and deletion
- User presence (online/offline)
- Typing indicators
- REST API for room management

## Installation

1. Install dependencies:
```cmd
npm install
```

2. Start the server:
```cmd
npm start
```

For development with auto-restart:
```cmd
npm run dev
```

## Configuration

The server runs on port 3001 by default. You can change this by setting the `PORT` environment variable:

```cmd
set PORT=8080
npm start
```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/rooms` - List all rooms
- `GET /api/room/:roomId/users` - Get users in a room
- `GET /api/room/:roomId/messages` - Get messages from a room

## WebSocket Events

### Client to Server:
- `user_join` - Join a room
- `send_message` - Send a text message
- `send_file` - Send a file
- `edit_message` - Edit a message
- `delete_message` - Delete a message
- `typing` - Typing indicator

### Server to Client:
- `user_joined` - User joined notification
- `user_left` - User left notification
- `new_message` - New message received
- `message_edited` - Message was edited
- `message_deleted` - Message was deleted
- `user_typing` - User typing indicator
- `room_info` - Room information on join

## Development

The server uses in-memory storage for simplicity. In production, you should use a proper database like MongoDB or PostgreSQL.
