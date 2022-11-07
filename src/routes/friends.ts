import express from 'express';
import { acceptFriend, addFriend, getFriends } from '../controllers/friends';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getFriends);
router.post('/add/:id', verifyToken, addFriend);
router.post('/accept/:id', verifyToken, acceptFriend);

export default router;
