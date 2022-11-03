import express from 'express';
import { login, register } from '../controllers/auth';
import validate from '../validation/validate';
import { registerUserSchema } from '../validation/validationSchemas';

const router = express.Router();

router.post('/register', validate(registerUserSchema), register);
router.post('/login', login);

export default router;
