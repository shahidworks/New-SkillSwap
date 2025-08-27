import express from 'express';
import {
  sendMessage,
  getChat,
  updateMessageStatus,
  markAsRead,
  sendChatMessage,
  getChatList,
  getMessages
} from '../controllers/messageController.js';
import authUser from '../middlewares/authMiddleware.js';

const router = express.Router();

// =====================
// Message Routes
// =====================

// Get all messages
// GET /api/messages
router.get('/', authUser, getMessages);

// Send a new message
// POST /api/messages
router.post('/', authUser, sendMessage);

// Update message status
// PUT /api/messages/:id/status
router.put('/:id/status', authUser, updateMessageStatus);

// Mark a message as read
// PATCH /api/messages/:messageId/read
router.patch('/:messageId/read', authUser, markAsRead);

// =====================
// Chat Routes
// =====================

// Get chat with a specific user
// GET /api/messages/chat/:userId
router.get('/chat/:userId', authUser, getChat);

// Send a chat message
// POST /api/messages/chat/message
router.post('/chat/message', authUser, sendChatMessage);

// Get list of chats
// GET /api/messages/chats
router.get('/chats', authUser, getChatList);

export default router;
