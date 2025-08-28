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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching skills from API...');
        
       const response = await axios.get(`${backendUrl}/api/skills/excluding-current-user`, {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex flex-col">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-800 to-indigo-700 bg-clip-text text-transparent mb-4">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover amazing skills in your community and share your expertise with others in our vibrant learning ecosystem.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-600">{label}</div>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <SearchAndFilter />
          </div>

          {/* Skills Grid */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Available Skills</h2>
              <p className="text-slate-600">Connect with talented individuals in your community</p>
            </div>
            
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-red-800 font-medium mb-1">Connection Issue</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <p className="text-xs text-red-600 mt-1">Showing sample data for demonstration</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 h-72 border border-purple-100">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full w-3/4 mb-4"></div>
                      <div className="h-3 bg-slate-200 rounded-full w-full mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded-full w-5/6 mb-6"></div>
                      <div className="h-10 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-xl w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No skills found</h3>
                <p className="text-slate-600">Try adjusting your search or check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-16 border border-purple-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">How SkillSwap+ Works</h2>
              <p className="text-slate-600">Simple steps to start your learning journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Browse Skills</h3>
                <p className="text-slate-600 leading-relaxed">Discover amazing skills from community members and find exactly what you want to learn.</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Connect & Exchange</h3>
                <p className="text-slate-600 leading-relaxed">Reach out to users and arrange skill exchanges using our innovative time credit system.</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Learn & Teach</h3>
                <p className="text-slate-600 leading-relaxed">Share your knowledge and gain new skills in our supportive and encouraging community.</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">What Our Community Says</h2>
              <p className="text-slate-600">Real stories from our amazing members</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 group">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="border-t border-purple-100 pt-4">
                    <div className="font-semibold text-slate-800">{testimonial.name}</div>
                    <div className="text-sm text-purple-600 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white mb-12 shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Share Your Skills?</h2>
              <p className="text-xl mb-8 opacity-90">Join thousands of community members exchanging knowledge and building meaningful connections.</p>
              <button className="bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Add Your Skills Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">SkillSwap+</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">Connecting communities through skill sharing and innovative time banking solutions.</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-all duration-300">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">Home</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">Browse Skills</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">My Profile</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">Time Bank</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">How It Works</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">Safety Tips</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">Community Guidelines</a></li>
                <li><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 text-slate-400">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>hello@skillswap.com</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-400">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-400">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Live Chat</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">© 2023 SkillSwap+. All rights reserved.</p>
            <div className="flex space-x-8">
              <a href="#" className="text-slate-400 hover:text-purple-400 text-sm transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-purple-400 text-sm transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-purple-400 text-sm transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal - First Step */}
      {isModalOpen && selectedSkill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Request Skill Exchange</h3>
                <button onClick={closeModal} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
                  <img 
                    src={selectedSkill.userAvatar || '/default-avatar.png'} 
                    alt={selectedSkill.userName}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">{selectedSkill.userName}</h4>
                    <p className="text-purple-600 font-medium">{selectedSkill.location}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-3">Skill You Want to Learn:</h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                      {selectedSkill.name}
                    </div>
                    <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-lg">
                      {selectedSkill.rate} hour{selectedSkill.rate !== 1 ? 's' : ''} per session
                    </div>
                  </div>
                  {selectedSkill.description && (
                    <p className="text-sm text-purple-700">{selectedSkill.description}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-3">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder={`Hi ${selectedSkill.userName}! I'd like to learn ${selectedSkill.name} from you. Are you interested in a skill exchange?`}
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={proceedToSkillSelection}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Send className="w-5 h-5 mr-3" />
                  Next: Select Your Skill to Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Selection Modal - Second Step */}
      {isSkillSelectionOpen && selectedSkill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Select Your Skill to Offer</h3>
                <button onClick={closeModal} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-3">You're requesting to learn:</h4>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                      {selectedSkill.name}
                    </div>
                  </div>
                  <p className="text-sm text-purple-700 mt-2">From: {selectedSkill.userName}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-4">Select one of your skills to offer in exchange:</h4>
                  
                  {userSkills.length === 0 ? (
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-6 mb-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h5 className="text-amber-800 font-medium mb-1">No Skills Added</h5>
                          <p className="text-amber-700 text-sm">You haven't added any skills to offer yet. Please add skills to your profile first.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userSkills.map((skill, index) => {
                        const isSelected = selectedSkillIndex === index;
                        
                        return (
                          <div
                            key={`skill-${index}`}
                            onClick={() => handleSkillSelection(skill, index)}
                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg transform scale-105'
                                : 'border-slate-200 hover:border-purple-300 hover:bg-purple-25 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className={`font-semibold text-lg ${
                                  isSelected ? 'text-purple-900' : 'text-slate-800'
                                }`}>
                                  {skill.name}
                                </h5>
                                <p className={`text-sm ${
                                  isSelected ? 'text-purple-700 font-medium' : 'text-slate-600'
                                }`}>
                                  {skill.category}
                                </p>
                                <p className={`text-sm mt-1 ${
                                  isSelected ? 'text-purple-700' : 'text-slate-600'
                                }`}>
                                  {skill.rate} hour{skill.rate !== 1 ? 's' : ''} per session
                                </p>
                                {skill.description && (
                                  <p className={`text-xs mt-2 ${
                                    isSelected ? 'text-purple-600' : 'text-slate-500'
                                  }`}>
                                    {skill.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center ml-6">
                                {isSelected ? (
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="ml-3 text-sm font-semibold text-purple-600">Selected</span>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 border-2 border-slate-300 rounded-full hover:border-purple-400 transition-colors duration-300"></div>
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
              
              <div className="space-y-4">
                <button
                  onClick={handleSendMessage}
                  disabled={!selectedSkillToOffer || isSending}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Send Exchange Request
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setIsSkillSelectionOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-slate-600 py-3 rounded-xl font-medium hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
                >
                  ← Back to Message
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