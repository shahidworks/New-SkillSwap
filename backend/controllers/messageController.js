import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import Skill from '../models/skillModel.js';
import mongoose from 'mongoose';

export const sendMessage = async (req, res) => {
  try {
    let { recipientId, skillId, offeredSkillId, content } = req.body;
    const senderId = req.user.id;

    console.log(`Sending message from ${senderId} to ${recipientId}`);
    console.log(`Raw request body:`, req.body);
    console.log(`Skill requested: ${skillId}, Skill offered: ${offeredSkillId}`);

    // Validate recipient
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID'
      });
    }

    // Validate and handle skill IDs
    let validSkillId = null;
    let validOfferedSkillId = null;

    if (skillId) {
      if (mongoose.Types.ObjectId.isValid(skillId)) {
        validSkillId = skillId;
      } else {
        console.warn(`Invalid skill ID format: ${skillId}`);
      }
    }

    if (offeredSkillId) {
      if (mongoose.Types.ObjectId.isValid(offeredSkillId)) {
        validOfferedSkillId = offeredSkillId;
      } else {
        console.warn(`Invalid offered skill ID format: ${offeredSkillId}`);
      }
    }

    // Generate chatId for grouping messages
    const chatId = [senderId, recipientId].sort().join('_');

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      chatId,
      skill: validSkillId,
      offeredSkill: validOfferedSkillId,
      content,
      status: 'pending'
    });

    await message.save();

    // Populate all details for the response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate({
        path: 'skill',
        select: 'name category rate level description',
        transform: (doc) => doc || null
      })
      .populate({
        path: 'offeredSkill',
        select: 'name category rate level description',
        transform: (doc) => doc || null
      });

    console.log('Message sent successfully:', populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Fetching messages for user:', userId);
    
    // Get all messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate({
        path: 'skill',
        select: 'name category rate level description',
        transform: (doc) => doc || null
      })
      .populate({
        path: 'offeredSkill',
        select: 'name category rate level description',
        transform: (doc) => doc || null
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${messages.length} messages`);
    
    // Group messages by chatId for the chat list view
    const chatMap = new Map();
    
    messages.forEach(message => {
      const partnerId = message.sender._id.toString() === userId 
        ? message.recipient._id.toString() 
        : message.sender._id.toString();
      
      const partner = message.sender._id.toString() === userId 
        ? message.recipient 
        : message.sender;
      
      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        });
      }
      
      const chat = chatMap.get(partnerId);
      chat.messages.push(message);
      
      // Update last message if this one is newer
      if (message.createdAt > chat.lastMessage.createdAt) {
        chat.lastMessage = message;
      }
      
      // Count unread messages
      if (!message.isRead && message.recipient._id.toString() === userId) {
        chat.unreadCount++;
      }
    });
    
    // Convert map to array
    const chats = Array.from(chatMap.values());
    
    res.json({
      success: true,
      data: {
        messages,
        chats
      }
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Handle credit transactions for skill exchange
const handleCreditTransaction = async (senderId, recipientId, requestedHours, offeredHours) => {
  try {
    // Find users
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
    
    if (!sender || !recipient) {
      return { success: false, error: "User not found" };
    }
    
    // Check if both users have enough credits
    if (sender.credits < requestedHours) {
      return { 
        success: false, 
        error: `${sender.name} doesn't have enough credits (needs ${requestedHours}, has ${sender.credits})` 
      };
    }
    
    if (recipient.credits < offeredHours) {
      return { 
        success: false, 
        error: `${recipient.name} doesn't have enough credits (needs ${offeredHours}, has ${recipient.credits})` 
      };
    }
    
    // Perform credit transactions
    await User.findByIdAndUpdate(senderId, { $inc: { credits: -requestedHours } });
    await User.findByIdAndUpdate(recipientId, { $inc: { credits: -offeredHours } });
    
    return { success: true };
  } catch (error) {
    console.error("Credit transaction failed:", error);
    return { success: false, error: error.message };
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    console.log(`Updating message ${id} to status: ${status} by user: ${userId}`);

    // Find the message first with proper population
    const message = await Message.findById(id)
      .populate("sender", "name email credits")
      .populate("recipient", "name email credits")
      .populate("skill", "name category rate level description")
      .populate("offeredSkill", "name category rate level description");

    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    // Check if user has permission to update this message
    const isRecipient = message.recipient._id.toString() === userId;
    const isSender = message.sender._id.toString() === userId;
    
    if (!isRecipient && !isSender) {
      return res.status(403).json({ 
        success: false, 
        error: "You don't have permission to update this message" 
      });
    }

    // Only recipient can accept/decline requests
    if ((status === 'accepted' || status === 'declined') && !isRecipient) {
      return res.status(403).json({ 
        success: false, 
        error: "Only the recipient can accept or decline exchange requests" 
      });
    }

    // If already processed, don't process again
    if (message.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: "This request has already been processed" 
      });
    }

    // Update the message status
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("sender", "name email credits")
      .populate("recipient", "name email credits")
      .populate("skill", "name category rate level description")
      .populate("offeredSkill", "name category rate level description");

    // If message accepted → handle credits
    if (status === "accepted") {
      try {
        // Parse the message content to get skill details
        let messageContent;
        try {
          messageContent = JSON.parse(message.content);
        } catch (err) {
          console.error("Error parsing message content:", err);
          return res.status(400).json({ 
            success: false, 
            error: "Invalid message content format" 
          });
        }

        const { skillRequested, skillOffered } = messageContent;

        if (!skillRequested?.rate || !skillOffered?.rate) {
          return res.status(400).json({ 
            success: false, 
            error: "Skill rates not found in message content" 
          });
        }

        // Deduct credits from both users
        const requestedHours = parseInt(skillRequested.rate);
        const offeredHours = parseInt(skillOffered.rate);

        // Find and update both users
        const sender = await User.findById(message.sender._id);
        const recipient = await User.findById(message.recipient._id);

        if (!sender || !recipient) {
          return res.status(404).json({ 
            success: false, 
            error: "User not found" 
          });
        }

        // Check if both users have enough credits
        if (sender.credits < requestedHours) {
          return res.status(400).json({ 
            success: false, 
            error: `${sender.name} doesn't have enough credits (needs ${requestedHours}, has ${sender.credits})` 
          });
        }

        if (recipient.credits < offeredHours) {
          return res.status(400).json({ 
            success: false, 
            error: `${recipient.name} doesn't have enough credits (needs ${offeredHours}, has ${recipient.credits})` 
          });
        }

        // Perform credit transactions
        sender.credits -= requestedHours;
        recipient.credits -= offeredHours;

        await sender.save();
        await recipient.save();

        console.log(`Credits deducted: ${sender.name} -${requestedHours}, ${recipient.name} -${offeredHours}`);

      } catch (error) {
        console.error("Credit transaction failed:", error);
        // Revert the message status if credit transaction fails
        await Message.findByIdAndUpdate(id, { status: 'pending' });
        
        return res.status(500).json({ 
          success: false, 
          error: "Failed to process credit transaction" 
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      data: updatedMessage,
      message: status === 'accepted' 
        ? 'Exchange accepted and credits deducted' 
        : 'Exchange declined'
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    console.log(`Marking message ${messageId} as read`);

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    console.log('Message marked as read:', message);

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark message as read'
    });
  }
};

export const getChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Generate chatId (sorted to ensure consistency)
    const chatId = [currentUserId, userId].sort().join('_');

    const messages = await Message.find({ chatId })
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('skill', 'name category rate level')
      .populate('offeredSkill', 'name category rate level')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
    
    const chatId = [senderId, recipientId].sort().join('_');
    
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      chatId,
      content,
      status: 'completed'
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar');

    // Emit the new message via Socket.io
    req.io.to(chatId).emit('receive-message', populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getChatList = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get distinct chat partners
    const chats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { recipient: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$$ROOT" },
          partnerId: {
            $first: {
              $cond: [
                { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
                "$recipient",
                "$sender"
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "partnerId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 0,
          user: {
            _id: 1,
            name: 1,
            avatar: 1
          },
          lastMessage: {
            _id: 1,
            content: 1,
            createdAt: 1,
            sender: 1
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};