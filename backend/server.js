// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDb from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRoutes from './routes/userRoute.js';
import skillrequestRoutes from './routes/skillrequestRoute.js';
import skillRoutes from './routes/skillRoute.js';
import messageRoutes from './routes/messageRoute.js';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

connectDb();
connectCloudinary();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send("Hello World");
});
app.use('/api/users', userRoutes);
app.use('/api/skillrequests', skillrequestRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);


// Add this test route to server.js
app.get('/api/test-messages', async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('skill', 'name category rate level')
      .populate('offeredSkill', 'name category rate level');
    
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a specific chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Handle sending messages
  socket.on('send-message', (newMessage) => {
    const { chatId } = newMessage;
    io.to(chatId).emit('receive-message', newMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(port, () => console.log('Server is running'));