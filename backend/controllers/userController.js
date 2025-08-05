import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User with Cloudinary image upload
const registerUser = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;
    const skillsOffered = JSON.parse(req.body.skillsOffered || "[]");
    const skillsWanted = JSON.parse(req.body.skillsWanted || "[]");

    // Validations
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, msg: "Invalid email format" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, msg: "Password must be at least 8 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let avatarUrl = "";

    // Upload avatar to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "skill_swap/avatars",
      });
      avatarUrl = result.secure_url;
    }

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      bio,
      avatar: avatarUrl,
      skillsOffered,
      skillsWanted,
    });

    const savedUser = await newUser.save();
    const token = createToken(savedUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        avatar: savedUser.avatar,
        skillsOffered: savedUser.skillsOffered,
        skillsWanted: savedUser.skillsWanted,
      },
    });
  } catch (err) {
    console.error("Error in registerUser:", err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
      },
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

const getUserFromToken = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error in getUserFromToken:", err);
    res.status(401).json({ success: false, msg: "Invalid token" });
  }
};

// Add a new skill (either offered or wanted)
const addSkill = async (req, res) => {
  try {
    const { type, ...skillData } = req.body;
    const userId = req.user.id;

    if (!['offered', 'wanted'].includes(type)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid skill type. Must be 'offered' or 'wanted'"
      });
    }

    // Validate required fields
    if (!skillData.name || !skillData.category) {
      return res.status(400).json({
        success: false,
        msg: "Name and category are required"
      });
    }

    // For offered skills, validate rate
    if (type === 'offered' && (!skillData.rate || skillData.rate < 1)) {
      return res.status(400).json({
        success: false,
        msg: "Valid rate is required for offered skills"
      });
    }

    const updateField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $push: { [updateField]: skillData } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const addedSkill = type === 'offered' 
      ? user.skillsOffered.slice(-1)[0]
      : user.skillsWanted.slice(-1)[0];

    res.status(201).json({
      success: true,
      data: addedSkill
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Remove a skill
const removeSkill = async (req, res) => {
  try {
    const { type, skillId } = req.params;
    const userId = req.user.id;

    if (!['offered', 'wanted'].includes(type)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid skill type. Must be 'offered' or 'wanted'"
      });
    }

    const updateField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    const updateQuery = { $pull: { [updateField]: { _id: skillId } } };
    
    const user = await userModel.findByIdAndUpdate(
      userId,
      updateQuery,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error("Error removing skill:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get all skills for a user
const getSkills = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id)
      .select('skillsOffered skillsWanted -_id');

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({
      success: true,
      data: {
        offered: user.skillsOffered,
        wanted: user.skillsWanted
      }
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export { 
  registerUser,
  loginUser, 
  getUserFromToken,
  addSkill,
  removeSkill,
  getSkills
};