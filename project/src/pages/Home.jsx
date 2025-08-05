import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SkillCard from '../components/SkillCard';
import SearchAndFilter from '../components/SearchAndFilter';
import { 
  TrendingUp, Users, Clock, Star, X, Mail, MessageSquare, Phone, 
  Heart, Linkedin, Twitter, Facebook, Instagram, Github, AlertCircle 
} from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching skills from API...');
        
        const response = await axios.get('/api/skills/excluding-current-user');
        console.log('Skills fetched:', response.data.data);
        
        setSkills(response.data.data || []);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(err.response?.data?.message || 'Failed to load skills');
        // Fallback to dummy data if API fails
        setSkills(getDummySkills());
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  const getDummySkills = () => {
    console.warn('Using dummy data as fallback');
    return [
      {
        _id: '1',
        name: 'Web Development',
        description: 'I can teach you HTML, CSS, and JavaScript basics',
        rate: 2,
        experienceLevel: 'intermediate',
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
        experienceLevel: 'advanced',
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSkill(null);
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
                {skills.map((skill) => (
                  <SkillCard
                    key={`${skill.userId}-${skill._id}`}
                    skill={skill}
                    onContact={() => handleContact(skill)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Rest of your existing components (How It Works, Testimonials, CTA, Footer) */}
          {/* ... */}


  {/* How It Works */}
         

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


        
      </div>

      {/* Footer */}
      {/* ... */}
      

      {/* Contact Modal */}
      {isModalOpen && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Ready to Connect?</h3>
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
                  <h4 className="font-semibold text-blue-800 mb-2">Offering:</h4>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedSkill.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedSkill.rate} hour{selectedSkill.rate !== 1 ? 's' : ''} per session
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{selectedSkill.description}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Details:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {selectedSkill.experienceLevel}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {selectedSkill.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <a 
                  href={`mailto:${selectedSkill.userEmail}`}
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send Email</span>
                </a>
                <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Start Chat</span>
                </button>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>All exchanges use our time banking system. 1 hour taught = 1 time credit earned.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;