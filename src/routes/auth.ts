import express from 'express';
import { getAuthUser, login, register } from '../controllers/auth';
import verifyToken from '../middleware/verifyToken';
import validate from '../validation/validate';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validation/validationSchemas';

const router = express.Router();

router.post('/register', validate(registerUserSchema), register);
router.post('/login', validate(loginUserSchema), login);
router.get('/user', verifyToken, getAuthUser);

export default router;
