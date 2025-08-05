import React, { createContext, useContext, useState } from 'react';
import { chats, users, allSkills, transactions, reviews } from '../data/dummyData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [skillsData] = useState(allSkills);
  const [usersData] = useState(users);
  const [chatsData, setChatsData] = useState(chats);
  const [transactionsData] = useState(transactions);
  const [reviewsData] = useState(reviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const sendMessage = (chatId, message) => {
    setChatsData(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessage = {
            id: Date.now().toString(),
            senderId: '1', // Current user
            content: message,
            timestamp: new Date().toISOString()
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: message,
            lastMessageTime: new Date().toISOString()
          };
        }
        return chat;
      })
    );
  };

  const markChatAsRead = (chatId) => {
    setChatsData(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  const filteredSkills = skillsData.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const value = {
    skills: filteredSkills,
    users: usersData,
    chats: chatsData,
    transactions: transactionsData,
    reviews: reviewsData,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sendMessage,
    markChatAsRead
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};