export const users = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    timeBalance: 15,
    location: 'San Francisco, CA',
    rating: 4.8,
    reviewCount: 24,
    joinedDate: '2023-01-15',
    skillsOffered: [
      { id: 's1', name: 'Web Development', category: 'Technology', rate: 2, description: 'Full-stack development with React and Node.js' },
      { id: 's2', name: 'UI/UX Design', category: 'Design', rate: 2, description: 'Creating beautiful and intuitive user interfaces' }
    ],
    skillsWanted: [
      { id: 'w1', name: 'Photography', category: 'Creative', rate: 1 },
      { id: 'w2', name: 'Spanish Language', category: 'Language', rate: 1 }
    ],
    bio: 'Passionate web developer and designer with 5+ years of experience. Love helping others learn coding and always eager to pick up new creative skills.'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    timeBalance: 8,
    location: 'Austin, TX',
    rating: 4.9,
    reviewCount: 31,
    joinedDate: '2022-11-20',
    skillsOffered: [
      { id: 's3', name: 'Photography', category: 'Creative', rate: 1, description: 'Portrait and event photography' },
      { id: 's4', name: 'Guitar Lessons', category: 'Music', rate: 1, description: 'Acoustic and electric guitar for beginners' }
    ],
    skillsWanted: [
      { id: 'w3', name: 'Web Development', category: 'Technology', rate: 2 },
      { id: 'w4', name: 'Marketing', category: 'Business', rate: 1 }
    ],
    bio: 'Professional photographer and musician. Enjoy sharing my creative skills and learning about technology and business.'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    timeBalance: 22,
    location: 'Seattle, WA',
    rating: 4.7,
    reviewCount: 18,
    joinedDate: '2023-03-10',
    skillsOffered: [
      { id: 's5', name: 'Spanish Language', category: 'Language', rate: 1, description: 'Native Spanish speaker offering conversational lessons' },
      { id: 's6', name: 'Yoga Instruction', category: 'Fitness', rate: 1, description: 'Hatha and Vinyasa yoga for all levels' }
    ],
    skillsWanted: [
      { id: 'w5', name: 'Cooking', category: 'Lifestyle', rate: 1 },
      { id: 'w6', name: 'Graphic Design', category: 'Design', rate: 1 }
    ],
    bio: 'Language teacher and certified yoga instructor. Love connecting with people and sharing wellness practices.'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    timeBalance: 12,
    location: 'Portland, OR',
    rating: 4.6,
    reviewCount: 15,
    joinedDate: '2023-02-28',
    skillsOffered: [
      { id: 's7', name: 'Cooking', category: 'Lifestyle', rate: 1, description: 'Asian cuisine and knife skills' },
      { id: 's8', name: 'Digital Marketing', category: 'Business', rate: 2, description: 'SEO, social media, and content marketing' }
    ],
    skillsWanted: [
      { id: 'w7', name: 'Piano Lessons', category: 'Music', rate: 1 },
      { id: 'w8', name: 'Photography', category: 'Creative', rate: 1 }
    ],
    bio: 'Chef turned digital marketer. Passionate about food, business growth, and learning new artistic skills.'
  }
];

export const currentUser = users[0];

export const chats = [
  {
    id: '1',
    participants: ['1', '2'],
    lastMessage: 'Thanks for the web development lesson! Really helpful.',
    lastMessageTime: '2024-01-15T10:30:00Z',
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: '2', content: 'Hi Sarah! I saw your web development skills. Could you help me with React?', timestamp: '2024-01-15T09:00:00Z' },
      { id: 'm2', senderId: '1', content: 'Hi Mike! Absolutely, I\'d be happy to help. I could use some photography tips in return.', timestamp: '2024-01-15T09:15:00Z' },
      { id: 'm3', senderId: '2', content: 'Perfect! That sounds like a great exchange. When would work for you?', timestamp: '2024-01-15T09:30:00Z' },
      { id: 'm4', senderId: '1', content: 'How about this weekend? We could do 2 hours each?', timestamp: '2024-01-15T09:45:00Z' },
      { id: 'm5', senderId: '2', content: 'Sounds perfect! Saturday afternoon works for me.', timestamp: '2024-01-15T10:00:00Z' },
      { id: 'm6', senderId: '2', content: 'Thanks for the web development lesson! Really helpful.', timestamp: '2024-01-15T10:30:00Z' }
    ]
  },
  {
    id: '2',
    participants: ['1', '3'],
    lastMessage: 'Looking forward to our Spanish lesson!',
    lastMessageTime: '2024-01-14T16:20:00Z',
    unreadCount: 2,
    messages: [
      { id: 'm7', senderId: '3', content: 'Hola! I can help you with Spanish lessons.', timestamp: '2024-01-14T15:00:00Z' },
      { id: 'm8', senderId: '1', content: 'That would be amazing! I\'m just starting out.', timestamp: '2024-01-14T15:30:00Z' },
      { id: 'm9', senderId: '3', content: 'No problem! We can start with basics. 1 hour for 1 hour?', timestamp: '2024-01-14T16:00:00Z' },
      { id: 'm10', senderId: '1', content: 'Perfect! I can help you with UI/UX design in return.', timestamp: '2024-01-14T16:10:00Z' },
      { id: 'm11', senderId: '3', content: 'Looking forward to our Spanish lesson!', timestamp: '2024-01-14T16:20:00Z' }
    ]
  }
];

export const transactions = [
  {
    id: 't1',
    type: 'earned',
    amount: 2,
    description: 'Web development lesson with Mike',
    date: '2024-01-15T10:30:00Z',
    otherUser: users[1]
  },
  {
    id: 't2',
    type: 'spent',
    amount: 1,
    description: 'Photography tips from Mike',
    date: '2024-01-15T11:30:00Z',
    otherUser: users[1]
  },
  {
    id: 't3',
    type: 'earned',
    amount: 2,
    description: 'UI/UX design consultation with Alex',
    date: '2024-01-14T14:00:00Z',
    otherUser: { name: 'Alex Wilson', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
  }
];

export const reviews = [
  {
    id: 'r1',
    reviewerId: '2',
    reviewerName: 'Mike Chen',
    reviewerAvatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    comment: 'Sarah is an excellent teacher! Her web development explanations are clear and practical.',
    skillExchanged: 'Web Development',
    date: '2024-01-15T12:00:00Z'
  },
  {
    id: 'r2',
    reviewerId: '4',
    reviewerName: 'David Park',
    reviewerAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    comment: 'Great UI/UX insights and very patient. Highly recommended!',
    skillExchanged: 'UI/UX Design',
    date: '2024-01-12T16:30:00Z'
  },
  {
    id: 'r3',
    reviewerId: '3',
    reviewerName: 'Emily Rodriguez',
    reviewerAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 4,
    comment: 'Very knowledgeable and helpful. Looking forward to more sessions!',
    skillExchanged: 'Web Development',
    date: '2024-01-10T10:15:00Z'
  }
];

export const skillCategories = [
  'All',
  'Technology',
  'Design',
  'Creative',
  'Music',
  'Language',
  'Fitness',
  'Lifestyle',
  'Business'
];

export const allSkills = users.flatMap(user => 
  user.skillsOffered.map(skill => ({
    ...skill,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userRating: user.rating,
    userLocation: user.location
  }))
);