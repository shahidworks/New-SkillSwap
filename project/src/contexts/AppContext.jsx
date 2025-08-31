import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      console.log('Fetching messages for user:', user.id);
      const response = await axios.get('/api/messages');
      console.log('Messages fetched:', response.data.data);
      
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
        setChats(response.data.data.chats || []);
        
        // Extract unread notifications
        const unread = (response.data.data.messages || []).filter(
          msg => msg.recipient && msg.recipient._id === user.id && !msg.isRead
        );
        setNotifications(unread);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/skills/excluding-current-user');
      setSkills(response.data.data || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.response?.data?.message || 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (recipientId, offeredSkillId, skillId, content) => {
    try {
      console.log('Sending message with:', {
        recipientId,
        offeredSkillId,
        skillId,
        content
      });
      
      // ✅ Ensure we're sending the correct data structure
      const requestData = {
        recipientId,
        skillId,  // skill being requested
        offeredSkillId,  // skill being offered
        content
      };
      
      console.log('Request data:', requestData);
      
      const response = await axios.post('/api/messages', requestData);
      
      console.log('Message sent successfully:', response.data.data);
      
      // Update local state
      setMessages(prev => [response.data.data, ...prev]);
      
      // Update chats
      const partnerId = response.data.data.recipient._id || response.data.data.recipient;
      setChats(prev => {
        const existingChatIndex = prev.findIndex(chat => 
          chat.partner._id === partnerId
        );
        
        if (existingChatIndex >= 0) {
          const updatedChats = [...prev];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            lastMessage: response.data.data,
            messages: [response.data.data, ...updatedChats[existingChatIndex].messages]
          };
          return updatedChats;
        } else {
          return [{
            partner: response.data.data.recipient,
            lastMessage: response.data.data,
            unreadCount: 0,
            messages: [response.data.data]
          }, ...prev];
        }
      });
      
      return response.data.data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      console.log(`Updating message ${messageId} to status ${status}`);
      const response = await axios.put(`/api/messages/${messageId}/status`, { status });
      
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? response.data.data : msg
        )
      );

      setChats(prev => 
        prev.map(chat => {
          if (chat.lastMessage._id === messageId) {
            return {
              ...chat,
              lastMessage: response.data.data
            };
          }
          return chat;
        })
      );

      return response.data.data;
    } catch (err) {
      console.error('Error updating message status:', err);
      throw err;
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      console.log(`Marking message ${messageId} as read`);
      const response = await axios.patch(`/api/messages/${messageId}/read`);
      
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? response.data.data : msg
        )
      );
      
      // Update chats to decrease unread count
      setChats(prev => 
        prev.map(chat => {
          if (chat.lastMessage._id === messageId) {
            return {
              ...chat,
              lastMessage: response.data.data,
              unreadCount: Math.max(0, chat.unreadCount - 1)
            };
          }
          return chat;
        })
      );
      
      setNotifications(prev => prev.filter(notif => notif._id !== messageId));
    } catch (err) {
      console.error('Error marking message as read:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSkills();
    if (user) {
      fetchMessages();
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMessages]);

  return (
    <AppContext.Provider
      value={{
        skills,
        messages,
        chats,
        notifications,
        isLoading,
        error,
        fetchSkills,
        fetchMessages,
        sendMessage,
        updateMessageStatus,
        markMessageAsRead,
        refreshUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);