// controllers/skillController.js
import User from '../models/userModel.js';

export const getSkillsExcludingCurrentUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    console.log(`Fetching skills excluding current user (ID: ${currentUserId})`);

    // Find all users except the current user and populate their skills
    const users = await User.find()
  .select('name email avatar skillsOffered location')
  .lean();

console.log(`Found ${users.length} users`);


    // Transform the data to flatten skills with user info
    const skills = users.flatMap(user => {
      return user.skillsOffered.map(skill => ({
        ...skill,
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar || '/default-avatar.png',
        userEmail: user.email,
        location: user.location || 'Chennai'
      }));
    });

    console.log(`Found ${skills.length} skills from other users`);

    res.json({
      success: true,
      data: skills,
      count: skills.length
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch skills'
    });
  }
};