import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, MessageSquare, Check, X, Clock, User, ChevronDown, Search,
  ArrowRight, BookOpen, Book
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';

const Messages = () => {
  const { user } = useAuth();
  const { messages, notifications, updateMessageStatus, markMessageAsRead } = useApp();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (messages.length > 0 && !selectedMessage) {
      setSelectedMessage(messages[0]);
    }
  }, [messages]);

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
    if (!message.isRead && message.recipient._id === user.id) {
      markMessageAsRead(message._id);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedMessage) return;
    await updateMessageStatus(selectedMessage._id, status);
  };

  const filteredMessages = messages.filter(message => {
    if (activeTab === 'inbox') {
      return message.recipient._id === user.id;
    } else if (activeTab === 'sent') {
      return message.sender._id === user.id;
    }
    return true;
  }).filter(message => {
    const partner = message.sender._id === user.id ? message.recipient : message.sender;
    return partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)]">
            {/* Message List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'inbox' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                  >
                    Inbox {notifications.length > 0 && (
                      <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'sent' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                  >
                    Sent
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No messages found
                  </div>
                ) : (
                  filteredMessages.map(message => {
                    const partner = message.sender._id === user.id ? message.recipient : message.sender;
                    return (
                      <div
                        key={message._id}
                        onClick={() => handleMessageSelect(message)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedMessage?._id === message._id ? 'bg-blue-50' : ''
                        } ${!message.isRead && message.recipient._id === user.id ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={partner.avatar || '/default-avatar.png'}
                            alt={partner.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {partner.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(message.createdAt))}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {message.skill?.name && (
                                <span className="font-medium">{message.skill.name}: </span>
                              )}
                              {message.content}
                            </p>
                            {message.status !== 'pending' && (
                              <span className={`text-xs mt-1 px-2 py-1 rounded-full ${
                                message.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                message.status === 'declined' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {message.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 flex flex-col">
              {selectedMessage ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            selectedMessage.sender._id === user.id 
                              ? selectedMessage.recipient.avatar || '/default-avatar.png'
                              : selectedMessage.sender.avatar || '/default-avatar.png'
                          }
                          alt={
                            selectedMessage.sender._id === user.id 
                              ? selectedMessage.recipient.name
                              : selectedMessage.sender.name
                          }
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedMessage.sender._id === user.id 
                              ? selectedMessage.recipient.name
                              : selectedMessage.sender.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(selectedMessage.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Skill Exchange Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Skill Exchange Proposal</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Requested Skill */}
                        <div className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center mb-2">
                            <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                            <h5 className="font-medium text-gray-700">Skill Requested</h5>
                          </div>
                          {selectedMessage.skill ? (
                            <>
                              <div className="font-semibold text-blue-600">{selectedMessage.skill.name}</div>
                              <div className="text-sm text-gray-600">{selectedMessage.skill.category}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {selectedMessage.skill.rate} hour{selectedMessage.skill.rate !== 1 ? 's' : ''} per session
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">No skill specified</div>
                          )}
                        </div>

                        {/* Offered Skill */}
                        <div className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center mb-2">
                            <Book className="w-4 h-4 text-green-500 mr-2" />
                            <h5 className="font-medium text-gray-700">Skill Offered</h5>
                          </div>
                          {selectedMessage.offeredSkill ? (
                            <>
                              <div className="font-semibold text-green-600">{selectedMessage.offeredSkill.name}</div>
                              <div className="text-sm text-gray-600">{selectedMessage.offeredSkill.category}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {selectedMessage.offeredSkill.rate} hour{selectedMessage.offeredSkill.rate !== 1 ? 's' : ''} per session
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">No skill offered</div>
                          )}
                        </div>
                      </div>

                      {selectedMessage.sender._id === user.id && (
                        <div className="mt-3 text-sm text-gray-600">
                          <ArrowRight className="w-4 h-4 inline mr-1" />
                          You offered to exchange skills
                        </div>
                      )}
                      {selectedMessage.recipient._id === user.id && (
                        <div className="mt-3 text-sm text-gray-600">
                          <ArrowRight className="w-4 h-4 inline mr-1" />
                          User wants to exchange skills with you
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="prose max-w-none mb-6">
                      <p>{selectedMessage.content}</p>
                    </div>

                    {/* Status */}
                    <div className={`text-center px-4 py-2 rounded-lg ${
                      selectedMessage.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedMessage.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      selectedMessage.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      This request is currently {selectedMessage.status}
                    </div>
                  </div>

                  {selectedMessage.recipient._id === user.id && selectedMessage.status === 'pending' && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => handleStatusUpdate('accepted')}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>Accept Exchange</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('declined')}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedMessage.status === 'accepted' && (
                    <div className="p-4 border-t border-gray-200 bg-green-50">
                      <div className="text-center">
                        <p className="text-green-800 font-medium mb-2">Skill exchange accepted!</p>
                        <button
                          onClick={() => window.location.href = `/chat/${selectedMessage.sender._id === user.id ? selectedMessage.recipient._id : selectedMessage.sender._id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Start Chatting
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium">Select a message</h3>
                    <p>Choose a message from the sidebar to view details</p>
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