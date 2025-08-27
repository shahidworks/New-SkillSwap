import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, MessageSquare, Check, X, Clock, Search,
  ArrowRight, BookOpen, Book, Send, AlertCircle,
  CheckCircle, XCircle
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';

const Messages = () => {
  const { user } = useAuth();
  const { chats, messages, notifications, updateMessageStatus, markMessageAsRead, fetchMessages, sendMessage } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        await fetchMessages();
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    
    // Mark all messages in this chat as read
    chat.messages.forEach(message => {
      if (!message.isRead && message.recipient._id === user.id) {
        markMessageAsRead(message._id);
      }
    });
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedChat) return;
    
    // Find the most recent skill exchange request message
    const exchangeRequest = selectedChat.messages
      .filter(msg => {
        try {
          const parsedContent = JSON.parse(msg.content);
          return parsedContent.type === 'skill_exchange_request' && msg.status === 'pending';
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (exchangeRequest) {
      await updateMessageStatus(exchangeRequest._id, status);
      
      // Send a system message about the status update
      const statusMessage = status === 'accepted' 
        ? `Great! ${user.name} has accepted your skill exchange request. You can now chat freely to coordinate your sessions.`
        : `${user.name} has declined your skill exchange request.`;
      
      try {
        const parsedRequest = JSON.parse(exchangeRequest.content);
        await sendMessage(
          parsedRequest.requesterId,
          null,
          null,
          JSON.stringify({
            type: 'system_message',
            content: statusMessage,
            exchangeStatus: status,
            originalRequest: parsedRequest
          })
        );
      } catch (error) {
        console.error('Error sending status update message:', error);
      }

      // Refresh messages to show the update
      await fetchMessages();
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedChat) return;
    
    try {
      setIsSending(true);
      await sendMessage(
        selectedChat.partner._id,
        null, // offeredSkillId - can be null for regular messages
        null, // skillId - can be null for regular messages
        replyContent
      );
      
      setReplyContent('');
      // Refresh messages to get the latest
      await fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    return chat.partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort messages in ASCENDING order (oldest first, like WhatsApp)
  const sortedMessages = selectedChat?.messages 
    ? [...selectedChat.messages].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      )
    : [];

  // Helper function to parse message content
  const parseMessageContent = (content) => {
    try {
      return JSON.parse(content);
    } catch {
      return { type: 'regular_message', content };
    }
  };

  // Helper function to render message content based on type
  const renderMessageContent = (message) => {
    const parsedContent = parseMessageContent(message.content);
    
    switch (parsedContent.type) {
      case 'skill_exchange_request':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Skill Exchange Request</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">{parsedContent.content}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">WANTS TO LEARN:</h4>
                  <p className="text-sm font-medium text-gray-900">{parsedContent.skillRequested.name}</p>
                  <p className="text-xs text-gray-600">{parsedContent.skillRequested.rate}h/session</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">OFFERS TO TEACH:</h4>
                  <p className="text-sm font-medium text-gray-900">{parsedContent.skillOffered.name}</p>
                  <p className="text-xs text-gray-600">{parsedContent.skillOffered.rate}h/session</p>
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              {message.status === 'pending' && (
                <>
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-600">Waiting for response</span>
                </>
              )}
              {message.status === 'accepted' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Exchange accepted!</span>
                </>
              )}
              {message.status === 'declined' && (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600">Exchange declined</span>
                </>
              )}
            </div>
          </div>
        );
      
      case 'system_message':
        return (
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">System Message</span>
            </div>
            <p className="text-sm text-gray-700">{parsedContent.content}</p>
          </div>
        );
      
      default:
        return <p className="break-words">{parsedContent.content || message.content}</p>;
    }
  };

  // Check if there's a pending skill exchange request that the current user can respond to
  const getPendingExchangeRequest = () => {
    if (!selectedChat) return null;
    
    const pendingRequest = selectedChat.messages
      .filter(msg => {
        try {
          const parsedContent = JSON.parse(msg.content);
          return parsedContent.type === 'skill_exchange_request' && 
                 msg.status === 'pending' && 
                 msg.recipient._id === user.id;
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return pendingRequest;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)]">
            {/* Chat List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => setActiveTab('chats')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'chats' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                  >
                    Chats {notifications.length > 0 && (
                      <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No chats found</p>
                  </div>
                ) : (
                  filteredChats.map(chat => (
                    <div
                      key={chat.partner._id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.partner._id === chat.partner._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={chat.partner.avatar || '/default-avatar.png'}
                          alt={chat.partner.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {chat.partner.name}
                            </h3>
                            {chat.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage.sender._id === user.id ? 'You: ' : ''}
                            {(() => {
                              const parsed = parseMessageContent(chat.lastMessage.content);
                              if (parsed.type === 'skill_exchange_request') {
                                return 'Skill exchange request';
                              } else if (parsed.type === 'system_message') {
                                return 'Status update';
                              }
                              return parsed.content || chat.lastMessage.content;
                            })()}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(chat.lastMessage.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedChat.partner.avatar || '/default-avatar.png'}
                        alt={selectedChat.partner.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedChat.partner.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Display all messages in chronological order (oldest first) */}
                    {sortedMessages.map(message => (
                      <div
                        key={message._id}
                        className={`mb-4 flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.sender._id === user.id 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                        >
                          {renderMessageContent(message)}
                          <p className={`text-xs mt-2 text-right ${message.sender._id === user.id 
                            ? 'text-blue-100' 
                            : 'text-gray-500'}`}
                          >
                            {formatDistanceToNow(new Date(message.createdAt))}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply input field */}
                  <form onSubmit={handleSendReply} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!replyContent.trim() || isSending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Action buttons for pending skill exchange requests */}
                  {(() => {
                    const pendingRequest = getPendingExchangeRequest();
                    if (!pendingRequest) return null;

                    return (
                      <div className="p-4 border-t border-gray-200 bg-yellow-50">
                        <div className="text-center mb-3">
                          <p className="text-sm text-yellow-800 font-medium">
                            Skill Exchange Request Pending
                          </p>
                          <p className="text-xs text-yellow-600">
                            Respond to this skill exchange request
                          </p>
                        </div>
                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={() => handleStatusUpdate('accepted')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                          >
                            <Check className="w-5 h-5" />
                            <span>Accept Exchange</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate('declined')}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
                          >
                            <X className="w-5 h-5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium">Select a chat</h3>
                    <p>Choose a chat from the sidebar to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;