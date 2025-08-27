import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/messages/chats');
        setChats(response.data.data || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No chats yet</p>
        </div>
      ) : (
        chats.map(chat => (
          <Link
            key={chat.user._id}
            to={`/chat/${chat.user._id}`}
            className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <img
              src={chat.user.avatar || '/default-avatar.png'}
              alt={chat.user.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-gray-900 truncate">{chat.user.name}</h3>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(chat.lastMessage.createdAt))}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {chat.lastMessage.sender._id === user.id ? 'You: ' : ''}
                {chat.lastMessage.content}
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default ChatList;