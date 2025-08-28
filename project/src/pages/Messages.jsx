import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, MessageSquare, Check, X, Clock, Search,
  ArrowRight, BookOpen, Book, Send, AlertCircle,
  CheckCircle, XCircle, Lock, CreditCard, Coins
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';
import io from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const { 
    chats, 
    messages, 
    notifications, 
    updateMessageStatus, 
    markMessageAsRead, 
    fetchMessages, 
    sendMessage, 
    refreshUser 
  } = useApp();
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const messagesContainerRef = useRef(null);
  const [processedRequests, setProcessedRequests] = useState(new Set());
  const [localMessages, setLocalMessages] = useState([]);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditError, setCreditError] = useState('');
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Listen for new messages
    socketRef.current.on('receive-message', (message) => {
      if (selectedChat && selectedChat.partner._id === message.sender._id) {
        setLocalMessages(prev => [...prev, message]);
        
        // Mark as read if it's for current user
        if (message.recipient._id === user.id && !message.isRead) {
          markMessageAsRead(message._id);
        }
      }
      
      // Refresh messages to update chat list
      fetchMessages();
    });

    // Listen for message status updates
    socketRef.current.on('message-status-updated', (updatedMessage) => {
      setLocalMessages(prev => 
        prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
      
      // Add to processed requests
      setProcessedRequests(prev => new Set([...prev, updatedMessage._id]));
      
      // Refresh messages to update chat list
      fetchMessages();
    });

    // Listen for credit updates
    socketRef.current.on('credits-updated', (userData) => {
      if (userData._id === user.id) {
        refreshUser();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedChat, user]);

  // Load processed requests from localStorage on component mount
  useEffect(() => {
    const savedProcessedRequests = localStorage.getItem('processedRequests');
    if (savedProcessedRequests) {
      setProcessedRequests(new Set(JSON.parse(savedProcessedRequests)));
    }
  }, []);

  // Save processed requests to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('processedRequests', JSON.stringify(Array.from(processedRequests)));
  }, [processedRequests]);

  const getCurrentUserId = () => {
    return user.id || user._id;
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        setIsScrolledToBottom(isAtBottom);
    }
  };

  useEffect(() => {
    if (isScrolledToBottom) {
        scrollToBottom();
    }
  }, [localMessages, isScrolledToBottom]);

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
    if (selectedChat?.messages) {
      setLocalMessages([...selectedChat.messages]);
    }
  }, [selectedChat?.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setLocalMessages([...chat.messages]);
    
    chat.messages.forEach(message => {
      const currentUserId = getCurrentUserId();
      const recipientId = message.recipient._id || message.recipient.id;
      
      if (!message.isRead && recipientId === currentUserId) {
        markMessageAsRead(message._id);
      }
    });
  };

  const checkUserCredits = (requestedHours, offeredHours, currentUserId, senderId) => {
    // Check if current user has enough credits
    if (currentUserId === senderId) {
      // Current user is the sender, needs to have at least requestedHours
      return user.credits >= requestedHours;
    } else {
      // Current user is the recipient, needs to have at least offeredHours
      return user.credits >= offeredHours;
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedChat) return;
    
    const exchangeRequest = localMessages
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
      try {
        const parsedContent = JSON.parse(exchangeRequest.content);
        const currentUserId = getCurrentUserId();
        const isSender = exchangeRequest.sender._id === currentUserId;
        
        const requestedHours = parsedContent.skillRequested.rate;
        const offeredHours = parsedContent.skillOffered.rate;
        
        // Check if user has enough credits
        if (status === 'accepted') {
          const hasEnoughCredits = checkUserCredits(
            requestedHours, 
            offeredHours, 
            currentUserId,
            exchangeRequest.sender._id
          );
          
          if (!hasEnoughCredits) {
            setCreditError(`You need ${isSender ? requestedHours : offeredHours} credits to accept this exchange. You currently have ${user.credits} credits.`);
            setShowCreditModal(true);
            return;
          }
        }
        
        // Add the request to processed requests immediately to hide buttons
        setProcessedRequests(prev => new Set([...prev, exchangeRequest._id]));
        
        // Update the local message status immediately
        setLocalMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === exchangeRequest._id 
              ? { ...msg, status } 
              : msg
          )
        );
        
        // Emit socket event for real-time update
        if (socketRef.current) {
          socketRef.current.emit('update-message-status', {
            messageId: exchangeRequest._id,
            status
          });
        }
        
        await updateMessageStatus(exchangeRequest._id, status);
        
        // Refresh user data to get updated credits
        await refreshUser();
        
        const statusMessage = status === 'accepted' 
          ? `Great! ${user.name} has accepted your skill exchange request. ${requestedHours} credit(s) have been deducted from your account.`
          : `${user.name} has declined your skill exchange request. This chat is now closed.`;
        
        try {
          // Create temporary system message for immediate display
          const tempSystemMessage = {
            _id: 'temp_' + Date.now(),
            content: JSON.stringify({
              type: 'system_message',
              content: statusMessage,
              exchangeStatus: status,
              originalRequest: parsedContent,
              creditDeduction: status === 'accepted' ? {
                senderDeduction: parsedContent.skillRequested.rate,
                recipientDeduction: parsedContent.skillOffered.rate
              } : null
            }),
            sender: { _id: getCurrentUserId(), name: user.name },
            recipient: selectedChat.partner,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          
          // Add to local messages immediately
          setLocalMessages(prevMessages => [...prevMessages, tempSystemMessage]);
          
          // Send via socket for real-time
          if (socketRef.current) {
            socketRef.current.emit('send-message', {
              recipientId: selectedChat.partner._id,
              content: JSON.stringify({
                type: 'system_message',
                content: statusMessage,
                exchangeStatus: status,
                originalRequest: parsedContent,
                creditDeduction: status === 'accepted' ? {
                  senderDeduction: parsedContent.skillRequested.rate,
                  recipientDeduction: parsedContent.skillOffered.rate
                } : null
              })
            });
          }
          
          await sendMessage(
            selectedChat.partner._id,
            null,
            null,
            JSON.stringify({
              type: 'system_message',
              content: statusMessage,
              exchangeStatus: status,
              originalRequest: parsedContent,
              creditDeduction: status === 'accepted' ? {
                senderDeduction: parsedContent.skillRequested.rate,
                recipientDeduction: parsedContent.skillOffered.rate
              } : null
            })
          );
        } catch (error) {
          console.error('Error sending status update message:', error);
        }

        // Refresh messages to get updated data
        setTimeout(async () => {
          await fetchMessages();
        }, 500);
      } catch (error) {
        console.error('Error processing status update:', error);
        // Remove from processed requests if there was an error
        setProcessedRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(exchangeRequest._id);
          return newSet;
        });
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedChat) return;
    
    const exchangeStatus = getExchangeStatus();
    if (exchangeStatus !== 'accepted') {
      alert("You can only send messages after the skill exchange has been accepted.");
      return;
    }
    
    try {
      setIsSending(true);
      
      // Create temporary message for immediate display
      const tempMessage = {
        _id: 'temp_' + Date.now(),
        content: replyContent,
        sender: { _id: getCurrentUserId(), name: user.name },
        recipient: selectedChat.partner,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // Add to local messages immediately
      setLocalMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Send via socket for real-time
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          recipientId: selectedChat.partner._id,
          content: replyContent
        });
      }
      
      // Clear the input immediately
      const messageToSend = replyContent;
      setReplyContent('');
      
      // Scroll to bottom to show new message
      setTimeout(scrollToBottom, 100);
      
      // Send the actual message
      await sendMessage(
        selectedChat.partner._id,
        null,
        null,
        messageToSend
      );
      
      // Refresh messages to get the real message with proper ID
      setTimeout(async () => {
        await fetchMessages();
      }, 500);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      // Remove the temporary message on error
      setLocalMessages(prevMessages => 
        prevMessages.filter(msg => !msg._id.startsWith('temp_'))
      );
    } finally {
      setIsSending(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    return chat.partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedMessages = localMessages.length > 0
    ? [...localMessages].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      )
    : [];

  const parseMessageContent = (content) => {
    try {
      return JSON.parse(content);
    } catch {
      return { type: 'regular_message', content };
    }
  };

  const getExchangeStatus = () => {
    if (!localMessages.length) return null;
    
    const exchangeRequest = localMessages
      .filter(msg => {
        try {
          const parsedContent = JSON.parse(msg.content);
          return parsedContent.type === 'skill_exchange_request';
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return exchangeRequest ? exchangeRequest.status : null;
  };

  const getPendingExchangeRequest = () => {
    if (!localMessages.length) return null;
    
    const currentUserId = getCurrentUserId();
    
    const pendingRequest = localMessages
      .filter(msg => {
        try {
          const parsedContent = JSON.parse(msg.content);
          const isExchangeRequest = parsedContent.type === 'skill_exchange_request';
          const isPending = msg.status === 'pending';
          
          // Check if this request has been processed locally or in the backend
          const isProcessed = processedRequests.has(msg._id);
          
          return isExchangeRequest && isPending && !isProcessed;
        } catch (error) {
          console.error('Error parsing message:', error);
          return false;
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return pendingRequest;
  };

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
                  <p className="text-xs text-gray-500 mt-1">Cost: {parsedContent.skillRequested.rate} credit(s)</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">OFFERS TO TEACH:</h4>
                  <p className="text-sm font-medium text-gray-900">{parsedContent.skillOffered.name}</p>
                  <p className="text-xs text-gray-600">{parsedContent.skillOffered.rate}h/session</p>
                  <p className="text-xs text-gray-500 mt-1">Cost: {parsedContent.skillOffered.rate} credit(s)</p>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-gray-100 rounded">
                <div className="flex items-center text-xs text-gray-600">
                  <Coins className="w-3 h-3 mr-1" />
                  <span>Your current balance: {user.credits} credit(s)</span>
                </div>
              </div>
            </div>
            
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
            {parsedContent.creditDeduction && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <div className="font-medium text-blue-800">Credit Deduction:</div>
                <div className='text-gray-600'>-{parsedContent.creditDeduction.senderDeduction} credit(s) from {parsedContent.originalRequest.requesterName}</div>
                <div className='text-gray-600'>-{parsedContent.creditDeduction.recipientDeduction} credit(s) from {selectedChat.partner.name}</div>
              </div>
            )}
          </div>
        );
      
      default:
        return <p className="break-words">{parsedContent.content || message.content}</p>;
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 mr-2" />
            <span className="font-medium">{user.credits} Credit(s)</span>
            <button 
              onClick={() => setShowCreditModal(true)}
              className="ml-4 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Buy More
            </button>
          </div>
        </div>
        
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
                            {chat.lastMessage.sender._id === getCurrentUserId() ? 'You: ' : ''}
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
                        {getExchangeStatus() === 'declined' && (
                          <p className="text-sm text-red-600 flex items-center">
                            <Lock className="w-4 h-4 mr-1" /> Chat closed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-6"
                  >
                    {sortedMessages.map(message => (
                      <div
                        key={message._id}
                        className={`mb-4 flex ${message.sender._id === getCurrentUserId() ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.sender._id === getCurrentUserId() 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                        >
                          {renderMessageContent(message)}
                          <p className={`text-xs mt-2 text-right ${message.sender._id === getCurrentUserId() 
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

                  {/* Reply input - only show if exchange is accepted */}
                  {getExchangeStatus() === 'accepted' ? (
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
                  ) : getExchangeStatus() === 'declined' ? (
                    <div className="p-4 border-t border-gray-200 bg-red-50 text-center">
                      <p className="text-red-600 flex items-center justify-center">
                        <Lock className="w-4 h-4 mr-2" /> This chat is closed as the exchange was declined
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 border-t border-gray-200 bg-yellow-50 text-center">
                      <p className="text-yellow-700">Waiting for exchange request to be accepted</p>
                    </div>
                  )}

                  {/* Action buttons for pending skill exchange requests */}
                  {(() => {
                    const pendingRequest = getPendingExchangeRequest();
                    
                    if (!pendingRequest) return null;

                    const currentUserId = getCurrentUserId();
                    const recipientId = pendingRequest.recipient._id || pendingRequest.recipient.id;
                    const senderId = pendingRequest.sender._id || pendingRequest.sender.id;
                    
                    const parsedContent = parseMessageContent(pendingRequest.content);
                    const requestedHours = parsedContent.skillRequested.rate;
                    const offeredHours = parsedContent.skillOffered.rate;

                    // Show buttons only if current user is the recipient (who needs to respond)
                    if (recipientId === currentUserId) {
                      return (
                        <div className="p-4 border-t border-gray-200 bg-yellow-50">
                          <div className="text-center mb-3">
                            <p className="text-sm text-yellow-800 font-medium">
                              Skill Exchange Request Pending
                            </p>
                            <p className="text-xs text-yellow-600">
                              {selectedChat.partner.name} wants to exchange skills with you
                            </p>
                            <div className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                              <div className="font-medium">Credit Requirements:</div>
                              <div>You will spend: {offeredHours} credit(s)</div>
                              <div>{selectedChat.partner.name} will spend: {requestedHours} credit(s)</div>
                              <div className="mt-1 flex items-center">
                                <Coins className="w-3 h-3 mr-1" />
                                Your current balance: {user.credits} credit(s)
                              </div>
                            </div>
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
                    } else if (senderId === currentUserId) {
                      // Show waiting message if current user is the sender
                      return (
                        <div className="p-4 border-t border-gray-200 bg-blue-50 text-center">
                          <p className="text-blue-700 flex items-center justify-center">
                            <Clock className="w-4 h-4 mr-2" /> 
                            Waiting for {selectedChat.partner.name} to respond to your request
                          </p>
                        </div>
                      );
                    }
                    
                    return null;
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

      {/* Credit Purchase Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Credit Purchase</h3>
                <button onClick={() => {
                  setShowCreditModal(false);
                  setCreditError('');
                }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {creditError ? (
                <div className="mb-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                      <p className="text-sm text-red-700">{creditError}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Purchase Credits:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[5, 10, 20, 50].map(amount => (
                        <div key={amount} className="border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                          <div className="font-bold text-lg">{amount} credits</div>
                          <div className="text-sm text-gray-600">${amount * 2}</div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Purchase Credits
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Credit Purchase Feature</h4>
                  <p className="text-gray-600">This feature will be implemented soon. For now, you can only use your initial 5 credits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;