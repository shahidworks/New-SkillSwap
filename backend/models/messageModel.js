// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillRequest' }, 
  text: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
