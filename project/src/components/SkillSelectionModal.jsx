import React from 'react';
import { X, CheckCircle } from 'lucide-react';

const SkillSelectionModal = ({
  isOpen,
  onClose,
  userSkills,
  selectedSkillIndex,
  onSkillSelect,
  selectedSkill,
  messageContent,
  onSendMessage,
  isSending
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Select Your Skill to Offer</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">You're requesting to learn:</h4>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedSkill.name}
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-2">From: {selectedSkill.userName}</p>
              <p className="text-sm text-blue-600 mt-1">Your message: "{messageContent}"</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Select one of your skills to offer in exchange:</h4>
              
              {userSkills.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">You haven't added any skills to offer yet. Please add skills to your profile first.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSkills.map((skill, index) => {
                    const isSelected = selectedSkillIndex === index;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => onSkillSelect(skill, index)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className={`font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {skill.name}
                            </h5>
                            <p className={`text-sm ${
                              isSelected ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {skill.category}
                            </p>
                            <p className={`text-sm mt-1 ${
                              isSelected ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {skill.rate} hour{skill.rate !== 1 ? 's' : ''} per session
                            </p>
                            {skill.description && (
                              <p className={`text-xs mt-1 ${
                                isSelected ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {skill.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center ml-4">
                            {isSelected ? (
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <span className="ml-2 text-sm font-medium text-blue-600">Selected</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-blue-400 transition-colors"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onSendMessage}
              disabled={selectedSkillIndex === null || isSending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Request...
                </>
              ) : (
                <>
                  Send Exchange Request
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 py-2 rounded-lg font-medium hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSelectionModal;