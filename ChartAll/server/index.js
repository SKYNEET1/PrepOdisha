const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = ['http://localhost:4002', 'http://localhost:3000', 'http://localhost:5173'];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true }
});

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

// ── MongoDB ────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('[DB] Connected to MongoDB'))
  .catch(err => console.error('[DB] Connection error:', err));

// ── Message Model ─────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
  senderId:    { type: String, required: true },
  senderName:  { type: String, required: true },
  senderImage: { type: String, default: '' },
  text:        { type: String, required: true },
}, { timestamps: true });

const Message = mongoose.model('ChatAllMessage', MessageSchema);

// ── Hardcoded Users ───────────────────────────────────────
const USERS = {
  'snrout18@gmail.com': {
    _id: '69f0bf1ac66efe1b772a8018',
    firstName: 'swagat',
    lastName: 'rout',
    email: 'snrout18@gmail.com',
    image: 'https://res.cloudinary.com/dhpvcjgsm/image/upload/v1777796196/sze7phgapgcvw0jcwmfy.png',
    accountType: 'Student',
  },
  'swagatrout18@gmail.com': {
    _id: '69f82a4adb22eb4147135bc0',
    firstName: 'Ram',
    lastName: 'Rout',
    email: 'swagatrout18@gmail.com',
    image: 'https://api.dicebear.com/5.x/initials/svg?seed=Ram Rout',
    accountType: 'Instructor',
  }
};

// ── REST API ──────────────────────────────────────────────
// Login — just validate email (no password check for simplicity)
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const user = USERS[email?.toLowerCase()];
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json({ user });
});

// Get chat history
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100).lean();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// ── Socket.io ─────────────────────────────────────────────
const onlineUsers = new Map(); // userId -> { socketId, name }

const ROOM = 'global';

io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  socket.on('join', ({ userId, name, image, accountType }) => {
    socket.data.userId = userId;
    socket.data.name = name;
    socket.data.image = image;
    socket.data.accountType = accountType || 'Student';
    socket.join(ROOM);
    
    onlineUsers.set(userId, { 
      userId, 
      name, 
      image, 
      accountType: socket.data.accountType 
    });

    console.log(`[Socket] ${name} joined. Online: ${onlineUsers.size}`);
    // Broadcast updated online users list
    io.to(ROOM).emit('onlineUsers', Array.from(onlineUsers.values()));
  });

  socket.on('sendMessage', async ({ userId, text }, callback) => {
    if (!text?.trim()) return;
    
    // Use the data stored on the socket during 'join' instead of hardcoded lookup
    const senderName = socket.data.name || 'Anonymous';
    const senderImage = socket.data.image || '';

    try {
      const msg = await Message.create({
        senderId: userId,
        senderName: senderName,
        senderImage: senderImage,
        text: text.trim(),
      });
      const msgJSON = msg.toJSON();
      io.to(ROOM).emit('message', msgJSON);
      if (typeof callback === 'function') callback({ success: true, message: msgJSON });
    } catch (err) {
      console.error('[Socket] sendMessage error:', err);
      if (typeof callback === 'function') callback({ error: 'Failed to send' });
    }
  });

  socket.on('disconnect', () => {
    if (socket.data.userId) {
      onlineUsers.delete(socket.data.userId);
      io.to(ROOM).emit('onlineUsers', Array.from(onlineUsers.values()));
      console.log(`[Socket] ${socket.data.name} disconnected. Online: ${onlineUsers.size}`);
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`[Server] ChartAll running on port ${PORT}`));
