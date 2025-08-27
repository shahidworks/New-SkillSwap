import React from 'react';
import { MessageSquare, Clock, Star, MapPin } from 'lucide-react';

const SkillCard = ({ skill, onContact }) => {
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{skill.name}</h3>
            <p className="text-sm text-gray-500">{skill.category}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
            {skill.level || 'Beginner'}
          </span>
        </div>
        
        {skill.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{skill.rate} hour{skill.rate !== 1 ? 's' : ''} per session</span>
          </div>
          {skill.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{skill.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={skill.userAvatar || '/default-avatar.png'}
              alt={skill.userName}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{skill.userName}</p>
              <p className="text-xs text-gray-500">{skill.userEmail}</p>
            </div>
          </div>
          
          <button
            onClick={onContact}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;