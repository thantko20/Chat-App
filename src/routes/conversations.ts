import express from 'express';
import { getConversations } from '../controllers/conversation';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getConversations);

export default router;
