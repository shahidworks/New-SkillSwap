// routes/skillRoutes.js
import express from 'express';
import { getSkillsExcludingCurrentUser } from '../controllers/skillController.js';
import authUser from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/excluding-current-user', authUser, getSkillsExcludingCurrentUser);

export default router;