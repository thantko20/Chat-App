import express from 'express';
import { getConversation, getConversations } from '../controllers/conversation';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getConversations);
router.get('/:id', verifyToken, getConversation);

export default router;
