const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Load configuration
let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (error) {
  console.log('Config file not found, using default settings');
  config = {
    server: { port: 3001, host: '0.0.0.0', cors: { origin: '*', methods: ['GET', 'POST'] } },
    rooms: { defaultRoom: 'general', maxUsersPerRoom: 100, maxMessagesPerRoom: 1000 },
    security: { maxFileSize: 10485760, allowedFileTypes: ['*'], rateLimit: { messages: 30, windowMs: 60000 } },
    logging: { level: 'info', logConnections: true, logMessages: false }
  };
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: config.server.cors
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// In-memory storage (in production, use a database)
const users = new Map();
const messages = [];
const rooms = new Map();

// Default room
const defaultRoom = config.rooms.defaultRoom;
rooms.set(defaultRoom, {
  id: defaultRoom,
  name: 'General Chat',
  users: new Set(),
  messages: []
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins
  socket.on('user_join', (userData) => {
    const userName = userData.user?.name || userData.name || 'Anonymous';
    const userNickname = userData.user?.nickname || userData.nickname || userName;
    const userAvatar = userData.user?.avatar || userData.avatar || userName.charAt(0).toUpperCase();
    const userRoom = userData.user?.room || userData.room || defaultRoom;
    
    const user = {
      id: socket.id,
      name: userName,
      nickname: userNickname,
      avatar: userAvatar,
      room: userRoom,
      status: 'online',
      joinedAt: new Date()
    };

    users.set(socket.id, user);
    socket.join(user.room);

    // Add user to room
    if (!rooms.has(user.room)) {
      rooms.set(user.room, {
        id: user.room,
        name: user.room,
        users: new Set(),
        messages: []
      });
    }
    rooms.get(user.room).users.add(socket.id);

    // Notify room about new user
    socket.to(user.room).emit('user_joined', {
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar
      },
      message: `${user.name} joined the chat`
    });

    // Send room info to the user (excluding current user)
    const roomUsers = Array.from(rooms.get(user.room).users)
      .map(userId => users.get(userId))
      .filter(Boolean)
      .filter(roomUser => roomUser.id !== user.id);

    socket.emit('room_info', {
      room: user.room,
      users: roomUsers,
      messages: rooms.get(user.room).messages.slice(-50) // Last 50 messages
    });

    console.log(`${user.name} joined room: ${user.room}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      text: data.text,
      sender: user.nickname,
      senderId: user.id,
      timestamp: Date.now(),
      room: user.room
    };

    // Store message in room
    rooms.get(user.room).messages.push(message);

    // Broadcast to room
    io.to(user.room).emit('new_message', message);
    console.log(`Message from ${user.name} in ${user.room}: ${data.text}`);
  });

  // Send file
  socket.on('send_file', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const fileMessage = {
      id: uuidv4(),
      type: 'file',
      fileName: data.fileName,
      fileData: data.fileData,
      fileSize: data.fileSize,
      fileType: data.fileType,
      sender: user.nickname,
      senderId: user.id,
      timestamp: Date.now(),
      room: user.room
    };

    // Store message in room
    rooms.get(user.room).messages.push(fileMessage);

    // Broadcast to room
    io.to(user.room).emit('new_message', fileMessage);
    console.log(`File from ${user.name} in ${user.room}: ${data.fileName}`);
  });

  // Edit message
  socket.on('edit_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.room);
    const messageIndex = room.messages.findIndex(msg => msg.id === data.messageId);
    
    if (messageIndex !== -1 && room.messages[messageIndex].senderId === user.id) {
      room.messages[messageIndex].text = data.newText;
      room.messages[messageIndex].edited = true;
      room.messages[messageIndex].editedAt = Date.now();

      io.to(user.room).emit('message_edited', {
        messageId: data.messageId,
        newText: data.newText,
        editedAt: Date.now()
      });
    }
  });

  // Delete message
  socket.on('delete_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.room);
    const messageIndex = room.messages.findIndex(msg => msg.id === data.messageId);
    
    if (messageIndex !== -1 && room.messages[messageIndex].senderId === user.id) {
      room.messages.splice(messageIndex, 1);

      io.to(user.room).emit('message_deleted', {
        messageId: data.messageId
      });
    }
  });

  // User typing
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.to(user.room).emit('user_typing', {
      user: user.nickname,
      isTyping: data.isTyping
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`User ${user.name} (${socket.id}) is disconnecting...`);
      
      // Remove user from room
      if (rooms.has(user.room)) {
        rooms.get(user.room).users.delete(socket.id);
        console.log(`Removed ${user.name} from room ${user.room}`);
      }

      // Notify room about user leaving
      socket.to(user.room).emit('user_left', {
        user: {
          id: user.id,
          name: user.name,
          nickname: user.nickname
        },
        message: `${user.name} left the chat`
      });

      users.delete(socket.id);
      console.log(`${user.name} disconnected and removed from users list`);
    } else {
      console.log(`Unknown user (${socket.id}) disconnected`);
    }
  });
});

// API Routes
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    userCount: room.users.size
  }));
  res.json(roomList);
});

app.get('/api/room/:roomId/users', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const roomUsers = Array.from(room.users)
    .map(userId => users.get(userId))
    .filter(Boolean);

  res.json(roomUsers);
});

app.get('/api/room/:roomId/messages', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const limit = parseInt(req.query.limit) || 50;
  const messages = room.messages.slice(-limit);
  res.json(messages);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: users.size,
    rooms: rooms.size
  });
});

// Debug endpoint to see current users
app.get('/api/debug/users', (req, res) => {
  const allUsers = Array.from(users.values());
  const roomUsers = Array.from(rooms.get('general')?.users || []);
  
  res.json({
    totalUsers: allUsers.length,
    users: allUsers,
    roomUsers: roomUsers,
    roomUserDetails: roomUsers.map(id => users.get(id)).filter(Boolean)
  });
});

const PORT = process.env.PORT || config.server.port;
const HOST = process.env.HOST || config.server.host;

server.listen(PORT, HOST, () => {
  console.log(`Klyra Server running on ${HOST}:${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Configuration loaded from: ${fs.existsSync(path.join(__dirname, 'config.json')) ? 'config.json' : 'default settings'}`);
});
