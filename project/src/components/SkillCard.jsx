import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';

const SkillCard = ({ skill, onContact }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={skill.userAvatar}
              alt={skill.userName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{skill.userName}</h3>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{skill.userLocation}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-yellow-600">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{skill.userRating}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{skill.name}</h4>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {skill.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{skill.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-blue-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{skill.rate}h rate</span>
          </div>
          <button
            onClick={() => onContact(skill)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;