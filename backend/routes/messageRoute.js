import express from 'express';
import { 
  sendMessage, 
  getChat, 
  updateMessageStatus,
  markAsRead,
  sendChatMessage,
  getChatList,
  getMessages  // Make sure this is imported
} from '../controllers/messageController.js';
import authUser from '../middlewares/authMiddleware.js';

const router = express.Router();

// Add this route to get all messages
router.get('/', authUser, getMessages);
router.post('/', authUser, sendMessage);
router.get('/chat/:userId', authUser, getChat);
router.get('/chats', authUser, getChatList);
router.post('/chat', authUser, sendChatMessage);
router.patch('/:messageId/status', authUser, updateMessageStatus);
router.patch('/:messageId/read', authUser, markAsRead);

export default router;