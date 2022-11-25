import express from 'express';
import {
  getConversation,
  getConversations,
  getFriendConversation,
} from '../controllers/conversation';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getConversations);
router.get('/:id', verifyToken, getConversation);
router.get('/friend/:id', verifyToken, getFriendConversation);

export default router;
