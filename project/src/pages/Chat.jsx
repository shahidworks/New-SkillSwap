import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import ChatMessage from '../components/ChatMessage';
import { Send, Search, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';

const Chat = () => {
  const { chats, users, sendMessage, markChatAsRead } = useApp();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(chats[0] || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      sendMessage(selectedChat.id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (chat.unreadCount > 0) {
      markChatAsRead(chat.id);
    }
  };

  const getChatPartner = (chat) => {
    const partnerId = chat.participants.find(id => id !== user.id);
    return users.find(u => u.id === partnerId);
  };

  const filteredChats = chats.filter(chat => {
    const partner = getChatPartner(chat);
    return partner?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Chat List */}
          <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                filteredChats.map(chat => {
                  const partner = getChatPartner(chat);
                  if (!partner) return null;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={partner.avatar}
                            alt={partner.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {partner.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(chat.lastMessageTime))}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getChatPartner(selectedChat)?.avatar}
                        alt={getChatPartner(selectedChat)?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getChatPartner(selectedChat)?.name}
                        </h3>
                        <p className="text-sm text-green-600">Online</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {selectedChat.messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === user.id}
                    />
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the sidebar to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;