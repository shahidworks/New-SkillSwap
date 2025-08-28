// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import connectDb from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRoutes from './routes/userRoute.js';
import skillrequestRoutes from './routes/skillrequestRoute.js';
import skillRoutes from './routes/skillRoute.js';
import messageRoutes from './routes/messageRoute.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect DB and Cloudinary
connectDb();
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send("Hello World");
});
app.use('/api/users', userRoutes);
app.use('/api/skillrequests', skillrequestRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
