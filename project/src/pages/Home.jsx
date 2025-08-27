import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import SkillCard from '../components/SkillCard';
import SearchAndFilter from '../components/SearchAndFilter';
import { 
  TrendingUp, Users, Clock, Star, X, Mail, MessageSquare, Phone, 
  Heart, Linkedin, Twitter, Facebook, Instagram, Github, AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { user, token } = useAuth();
  const { skills: appSkills, sendMessage } = useApp();
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSkillSelectionOpen, setIsSkillSelectionOpen] = useState(false);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedSkillToOffer, setSelectedSkillToOffer] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching skills from API...');
        
        const response = await axios.get("http://localhost:4000/api/skills/excluding-current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Skills fetched:', response.data.data);
        
        setSkills(response.data.data || []);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(err.response?.data?.message || 'Failed to load skills');
        setSkills(getDummySkills());
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [user, token]);

  useEffect(() => {
    // Get user's offered skills for the selection modal
    if (user && user.skillsOffered) {
      setUserSkills(user.skillsOffered);
      console.log('User skills loaded:', user.skillsOffered);
    }
  }, [user]);

  const getDummySkills = () => {
    console.warn('Using dummy data as fallback');
    return [
      {
        _id: '1',
        name: 'Web Development',
        description: 'I can teach you HTML, CSS, and JavaScript basics',
        rate: 2,
        level: 'Intermediate',
        category: 'Technology',
        userId: '123',
        userName: 'Alex Johnson',
        userAvatar: '/default-avatar.png',
        location: 'New York, NY'
      },
      {
        _id: '2',
        name: 'Photography',
        description: 'Learn composition and lighting techniques',
        rate: 1,
        level: 'Advanced',
        category: 'Arts',
        userId: '456',
        userName: 'Maria Garcia',
        userAvatar: '/default-avatar.png',
        location: 'Los Angeles, CA'
      }
    ];
  };

  const handleContact = (skill) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
    // Set default message content
    setMessageContent(`Hi ${skill.userName}! I'd like to learn ${skill.name} from you. Are you interested in a skill exchange?`);
    console.log('Contacting user for skill:', skill);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSkillSelectionOpen(false);
    setSelectedSkill(null);
    setSelectedSkillToOffer(null);
    setMessageContent('');
    setSelectedSkillIndex(null);
    console.log('Modal closed, selection reset');
  };

  const proceedToSkillSelection = () => {
    if (!messageContent.trim()) {
      alert('Please enter a message before proceeding');
      return;
    }
    setIsModalOpen(false);
    setIsSkillSelectionOpen(true);
    console.log('Proceeding to skill selection with message:', messageContent);
  };

  const handleSkillSelection = (skill, index) => {
    console.log('Selected skill at index:', index, skill);
    
    if (selectedSkillIndex === index) {
      setSelectedSkillIndex(null);
      setSelectedSkillToOffer(null);
      console.log('Deselected skill');
    } else {
      setSelectedSkillIndex(index);
      setSelectedSkillToOffer(skill);
      console.log('Selected new skill:', skill);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedSkillToOffer || !messageContent.trim() || !selectedSkill) {
      alert('Please select a skill to offer and enter a message');
      return;
    }
    
    try {
      setIsSending(true);
      
      console.log('=== DEBUG: Skill Selection ===');
      console.log('selectedSkillToOffer:', selectedSkillToOffer);
      console.log('selectedSkill:', selectedSkill);
      
      // Extract offered skill ID
      let skillOfferedId = null;
      if (selectedSkillToOffer && selectedSkillToOffer._id) {
        skillOfferedId = selectedSkillToOffer._id.toString();
      }
      
      // Handle requested skill ID
      let skillRequestedId = null;
      if (selectedSkill && selectedSkill._id) {
        skillRequestedId = selectedSkill._id.toString();
      } else if (selectedSkill && selectedSkill.id) {
        skillRequestedId = selectedSkill.id.toString();
      } else if (selectedSkill && selectedSkill.skillId) {
        skillRequestedId = selectedSkill.skillId.toString();
      } else if (selectedSkill && selectedSkill.userId && selectedSkill.name) {
        skillRequestedId = `${selectedSkill.userId}_${selectedSkill.name.replace(/\s+/g, '_')}`;
        console.log('⚠️  Using generated skill ID:', skillRequestedId);
      }
      
      console.log('=== DEBUG: Extracted IDs ===');
      console.log('skillOfferedId:', skillOfferedId);
      console.log('skillRequestedId:', skillRequestedId);
      
      if (!skillOfferedId) {
        console.error('❌ Could not extract offered skill ID');
        alert('Error: Could not identify the skill you want to offer');
        return;
      }
      
      if (!skillRequestedId) {
        console.error('❌ Could not extract requested skill ID');
        alert('Error: Could not identify the skill you want to learn');
        return;
      }
      
      // Get recipient ID
      let recipientId = selectedSkill.userId || selectedSkill.user?._id || selectedSkill.owner;
      
      if (!recipientId) {
        console.error('❌ No recipient ID found');
        alert('Error: Could not identify the skill owner');
        return;
      }

      // Create structured message for skill exchange
      const exchangeMessage = {
        content: messageContent,
        type: 'skill_exchange_request',
        skillRequested: {
          id: skillRequestedId,
          name: selectedSkill.name,
          description: selectedSkill.description,
          rate: selectedSkill.rate,
          owner: selectedSkill.userName
        },
        skillOffered: {
          id: skillOfferedId,
          name: selectedSkillToOffer.name,
          description: selectedSkillToOffer.description,
          rate: selectedSkillToOffer.rate,
          owner: user.name
        },
        requesterId: user.id || user._id,
        requesterName: user.name
      };

      // Send the exchange request
      await sendMessage(
        recipientId,
        skillOfferedId,
        skillRequestedId,
        JSON.stringify(exchangeMessage) // Send as JSON string to preserve structure
      );
      
      console.log('✅ Skill exchange request sent successfully');
      closeModal();
      alert('Your skill exchange request has been sent successfully!');
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      alert('Failed to send request. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const stats = [
    { icon: Users, label: 'Active Users', value: '1,234' },
    { icon: TrendingUp, label: 'Skills Available', value: skills.length || '0' },
    { icon: Clock, label: 'Hours Exchanged', value: '1,234' },
    { icon: Star, label: 'Average Rating', value: '4.8' }
  ];

  const testimonials = [
    {
      quote: "SkillSwap+ helped me learn photography while teaching others web development. It's changed how I spend my free time!",
      name: "Alex Johnson",
      role: "Web Developer & Photographer"
    },
    {
      quote: "I've made friends and learned gardening skills I never thought I'd have. The time banking system is brilliant.",
      name: "Maria Garcia",
      role: "Community Gardener"
    },
    {
      quote: "As a busy professional, I love being able to exchange skills without money. I teach Spanish and get yoga lessons in return!",
      name: "David Kim",
      role: "Language Teacher"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing skills in your community and share your expertise with others.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <SearchAndFilter />

          {/* Skills Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Skills</h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                    <p className="text-xs text-red-600 mt-1">Showing dummy data as fallback</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 h-64 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-6"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
                <p className="text-gray-600">Try adjusting your search or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, index) => (
                  <SkillCard
                    key={`skill-${skill.userId}-${skill._id || skill.id || index}`}
                    skill={skill}
                    onContact={() => handleContact(skill)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How SkillSwap+ Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Skills</h3>
                <p className="text-gray-600">Find skills you want to learn from community members near you.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect & Exchange</h3>
                <p className="text-gray-600">Reach out to users and arrange skill exchanges using time credits.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn & Teach</h3>
                <p className="text-gray-600">Share your knowledge and gain new skills in a supportive community.</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Our Community Says</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-center text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Share Your Skills?</h2>
            <p className="mb-6 max-w-2xl mx-auto">Join thousands of community members exchanging knowledge and building connections.</p>
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Add Your Skills Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SkillSwap+</h3>
              <p className="text-gray-400">Connecting communities through skill sharing and time banking.</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Browse Skills</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">My Profile</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Time Bank</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@skillswap.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 SkillSwap+. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal - First Step */}
      {isModalOpen && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Request Skill Exchange</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={selectedSkill.userAvatar || '/default-avatar.png'} 
                    alt={selectedSkill.userName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{selectedSkill.userName}</h4>
                    <p className="text-gray-600">{selectedSkill.location}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Skill You Want to Learn:</h4>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedSkill.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedSkill.rate} hour{selectedSkill.rate !== 1 ? 's' : ''} per session
                    </div>
                  </div>
                  {selectedSkill.description && (
                    <p className="text-sm text-blue-700 mt-2">{selectedSkill.description}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder={`Hi ${selectedSkill.userName}! I'd like to learn ${selectedSkill.name} from you. Are you interested in a skill exchange?`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={proceedToSkillSelection}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Next: Select Your Skill to Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Selection Modal - Second Step */}
      {isSkillSelectionOpen && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Select Your Skill to Offer</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                            key={`skill-${index}`}
                            onClick={() => handleSkillSelection(skill, index)}
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
                  onClick={handleSendMessage}
                  disabled={!selectedSkillToOffer || isSending}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Exchange Request
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setIsSkillSelectionOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-gray-600 py-2 rounded-lg font-medium hover:text-gray-800 transition-colors"
                >
                  Back to Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;