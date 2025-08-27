import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatId: {
    type: String,
    required: true,
    index: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: false,  // ✅ Changed to false since skills might be embedded
    default: null
  },
  offeredSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill', 
    required: false,  // ✅ Changed to false since skills might be embedded
    default: null
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ chatId: 1 });
const Message = mongoose.model('Message', messageSchema);

export default Message;