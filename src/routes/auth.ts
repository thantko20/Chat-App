import express from 'express';
import { login, register } from '../controllers/auth';
import validate from '../validation/validate';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validation/validationSchemas';

const router = express.Router();

router.post('/register', validate(registerUserSchema), register);
router.post('/login', validate(loginUserSchema), login);

export default router;
