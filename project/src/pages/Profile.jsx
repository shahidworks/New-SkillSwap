import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, Star, Clock, Calendar, Plus, Edit3, 
  TrendingUp, TrendingDown, X, Check, ChevronDown,
  User, Mail, Info, Lock, LogOut, Trash2, Coins
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const Profile = () => {
  const { 
    user, 
    logout, 
    fetchUser, 
    addSkill, 
    removeSkill,
    updateProfile,
    updateAvatar
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [skillType, setSkillType] = useState('offered');
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    description: '',
    rate: 1,
    experienceLevel: 'beginner'
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    skill: false,
    avatar: false
  });
  const [error, setError] = useState(null);

  const categories = [
    'Technology',
    'Languages',
    'Arts & Crafts',
    'Music',
    'Sports',
    'Cooking',
    'Academic',
    'Professional',
    'Other'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'reviews', label: 'Reviews' }
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleAddSkillClick = (type) => {
    setSkillType(type);
    setIsAddSkillModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddSkillModalOpen(false);
    setNewSkill({
      name: '',
      category: '',
      description: '',
      rate: 1,
      experienceLevel: 'beginner'
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitSkill = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, skill: true }));
    setError(null);
    
    try {
      console.log('Submitting skill:', { ...newSkill, type: skillType });
      await addSkill({ ...newSkill, type: skillType });
      handleCloseModal();
    } catch (err) {
      console.error('Error adding skill:', err);
      setError(err.message || 'Failed to add skill');
    } finally {
      setLoadingStates(prev => ({ ...prev, skill: false }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, profile: true }));
    setError(null);
    
    try {
      console.log('Updating profile:', profileData);
      await updateProfile(profileData);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoadingStates(prev => ({ ...prev, profile: false }));
    }
  };

  const handleUpdateAvatar = async () => {
    if (!selectedFile) return;
    
    setLoadingStates(prev => ({ ...prev, avatar: true }));
    setError(null);
    
    try {
      console.log('Updating avatar with file:', selectedFile);
      await updateAvatar(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err.message || 'Failed to update avatar');
    } finally {
      setLoadingStates(prev => ({ ...prev, avatar: false }));
    }
  };

  const handleRemoveSkill = async (skillId, type) => {
    if (!window.confirm(`Are you sure you want to remove this ${type} skill?`)) return;
    
    try {
      console.log(`Removing ${type} skill with ID:`, skillId);
      await removeSkill(skillId, type);
    } catch (err) {
      console.error('Error removing skill:', err);
      setError(err.message || 'Failed to remove skill');
    }
  };

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {tab.label}
    </button>
  );

  const SkillBadge = ({ skill, type }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
      <button 
        onClick={() => handleRemoveSkill(skill._id, type)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{skill.name}</h4>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {skill.category}
        </span>
      </div>
      {skill.description && (
        <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-blue-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{skill.rate}h rate</span>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
          {skill.experienceLevel || skill.desiredLevel}
        </span>
      </div>
    </div>
  );

  const TransactionItem = ({ transaction }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {transaction.type === 'earned' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className={`text-lg font-semibold ${
        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}h
      </div>
    </div>
  );

  const ReviewItem = ({ review }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <img
          src={review.reviewerAvatar || '/default-avatar.png'}
          alt={review.reviewerName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
          <div className="text-xs text-gray-500">
            {review.skillExchanged} • {formatDate(review.date)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) return <div className="flex justify-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={
                  selectedFile 
                    ? URL.createObjectURL(selectedFile) 
                    : user.avatar || '/default-avatar.png'
                }
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              {editMode && (
                <>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
                    <Edit3 className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  {selectedFile && (
                    <button
                      onClick={handleUpdateAvatar}
                      disabled={loadingStates.avatar}
                      className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full text-xs"
                    >
                      {loadingStates.avatar ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-3xl font-bold text-gray-900"
                  />
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <button 
                      onClick={() => setEditMode(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location || 'Chennai'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{user.rating || '4.5'}</span>
                      <span>({user.reviewCount || '99+'} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  {user.bio && (
                    <p className="text-gray-700">{user.bio}</p>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col items-center space-y-4">
              {/* Credits Display */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                  <Coins className="w-6 h-6" />
                  <span className="text-2xl font-bold">{user.credits || 0}</span>
                </div>
                <div className="text-sm text-gray-600">Credits</div>
              </div>
              
              {/* Time Balance Display */}
              <div className="text-center">
               
              </div>
            </div>
          </div>
          {editMode && (
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditMode(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={loadingStates.profile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingStates.profile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
       <div className="flex space-x-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
  {tabs.map(tab => (
    <TabButton
      key={tab.id}
      tab={tab}
      isActive={activeTab === tab.id}
      onClick={setActiveTab}
    />
  ))}
</div>


        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Skills Offered</h2>
                  <button 
                    onClick={() => handleAddSkillClick('offered')}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Skill</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {user.skillsOffered?.length > 0 ? (
                    user.skillsOffered.map(skill => (
                      <SkillBadge key={skill._id} skill={skill} type="offered" />
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                      No skills offered yet
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Skills Wanted</h2>
                  <button 
                    onClick={() => handleAddSkillClick('wanted')}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Skill</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {user.skillsWanted?.length > 0 ? (
                    user.skillsWanted.map(skill => (
                      <SkillBadge key={skill._id} skill={skill} type="wanted" />
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                      No skills wanted yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Skills Offered</h2>
                  <button 
                    onClick={() => handleAddSkillClick('offered')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add New Skill
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.skillsOffered?.length > 0 ? (
                    user.skillsOffered.map(skill => (
                      <SkillBadge key={skill._id} skill={skill} type="offered" />
                    ))
                  ) : (
                    <div className="col-span-2 bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                      You haven't added any skills to offer yet
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Skills Wanted</h2>
                  <button 
                    onClick={() => handleAddSkillClick('wanted')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add New Want
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.skillsWanted?.length > 0 ? (
                    user.skillsWanted.map(skill => (
                      <SkillBadge key={skill._id} skill={skill} type="wanted" />
                    ))
                  ) : (
                    <div className="col-span-2 bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                      You haven't added any skills you want to learn yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction History</h2>
              <div className="space-y-4">
                {user.transactions?.length > 0 ? (
                  user.transactions.map(transaction => (
                    <TransactionItem key={transaction._id} transaction={transaction} />
                  ))
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                    No transactions yet
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reviews</h2>
              <div className="space-y-4">
                {user.reviews?.length > 0 ? (
                  user.reviews.map(review => (
                    <ReviewItem key={review._id} review={review} />
                  ))
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                    No reviews yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {isAddSkillModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {skillType === 'offered' ? 'Add New Skill' : 'Add Skill You Want'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitSkill}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newSkill.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-left"
                      >
                        <span>{newSkill.category || 'Select a category'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      {isCategoryDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-gray-200 max-h-60 overflow-auto">
                          {categories.map((category) => (
                            <div
                              key={category}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewSkill({ ...newSkill, category });
                                setIsCategoryDropdownOpen(false);
                              }}
                            >
                              {category}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newSkill.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                        {skillType === 'offered' ? 'Hourly Rate' : 'Expected Hours'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="rate"
                          name="rate"
                          min="1"
                          max="10"
                          value={newSkill.rate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <span className="absolute right-3 top-2 text-gray-500">hours</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                        {skillType === 'offered' ? 'Experience Level' : 'Desired Level'}
                      </label>
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={newSkill.experienceLevel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {experienceLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingStates.skill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loadingStates.skill ? (
                      'Adding...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Add Skill</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );}

export default Profile;