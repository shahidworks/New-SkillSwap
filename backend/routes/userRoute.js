import express from 'express';
import { 
  loginUser, 
  registerUser, 
  getUserFromToken,
  addSkill,
  removeSkill,
  getSkills
} from '../controllers/userController.js';
import authUser from '../middlewares/authMiddleware.js';
import upload from "../middlewares/multer.js";

const router = express.Router();

// Authentication routes
router.post('/login', loginUser);
router.post('/register', upload.single('avatar'), registerUser);
router.get('/me', authUser, getUserFromToken);

// Skill management routes
router.post('/skills', authUser, addSkill);
router.delete('/skills/:type/:skillId', authUser, removeSkill);
router.get('/skills', authUser, getSkills);

export default router;