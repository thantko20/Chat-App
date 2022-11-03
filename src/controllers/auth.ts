import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../services/db';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

export const login = (req: Request, res: Response) => {
  // TODO
};

export const register = async (req: Request, res: Response) => {
  // TODO
  // Validate and sanitized the form inputs
  // Check if there is already the same email or handlename
  // Validate image input

  const {
    firstName,
    lastName,
    handleName,
    email,
    password: plainTextPassword,
  } = req.body;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const password = await bcrypt.hash(plainTextPassword, salt);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      handleName,
      email,
      emailVerified: true,
      password,
      salt,
    },
    select: {
      firstName: true,
      lastName: true,
      handleName: true,
      email: true,
      emailVerified: true,
      id: true,
      profile_image: true,
    },
  });

  res.json({ data: newUser });
};
