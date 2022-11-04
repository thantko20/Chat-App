import { body } from 'express-validator';
import { prisma } from '../services/db';

export const registerUserSchema = [
  body('firstName')
    .notEmpty()
    .isAlpha('en-US', { ignore: 's' })
    .trim()
    .escape(),
  body('lastName').notEmpty().isAlpha('en-US', { ignore: 's' }).trim().escape(),
  body('email').notEmpty().isEmail().trim().escape(),
  body('handleName').notEmpty().trim().escape(),
  body('password').notEmpty(),
];

export const loginUserSchema = [
  body('email').notEmpty().isEmail().escape(),
  body('password').notEmpty(),
];
