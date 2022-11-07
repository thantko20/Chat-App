import express from 'express';
import { addFriend, getFriends } from '../controllers/friends';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getFriends);
router.post('/add/:id', verifyToken, addFriend);

export default router;
