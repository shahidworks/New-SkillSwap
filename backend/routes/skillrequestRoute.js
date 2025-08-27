import express from "express";
import {
  createSkillRequest,
  getSentRequests,
  getReceivedRequests,
  updateSkillRequestStatus
} from '../controllers/skillrequestController.js';
import authUser from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authUser, createSkillRequest);
router.get('/sent', authUser, getSentRequests);
router.get('/received', authUser, getReceivedRequests);
router.patch('/:requestId', authUser, updateSkillRequestStatus);

export default router;
