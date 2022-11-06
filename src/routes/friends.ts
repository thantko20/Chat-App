import express from 'express';
import { getFriends } from '../controllers/friends';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getFriends);

export default router;
