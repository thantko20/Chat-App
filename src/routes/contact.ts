import express from 'express';
import { addContact, getContacts, removeContact } from '../controllers/contact';
import verifyToken from '../middleware/verifyToken';

const router = express.Router();

router.get('/', verifyToken, getContacts);

router
  .post('/:userId', verifyToken, addContact)
  .delete('/:contactId', verifyToken, removeContact);

export default router;
