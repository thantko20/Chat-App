import express from 'express';
import { addContact, getContacts } from '../controllers/contact';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getContacts);

router.get('/search', verifyToken, () => {
  // TODO,
  // Might not be needed since this operation
  // will be used with socket.
});

router.post('/add/:userId', verifyToken, addContact);

export default router;
