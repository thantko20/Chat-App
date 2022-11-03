import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../services/db';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

export const login = (req: Request, res: Response) => {
  // TODO
};

export const register = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    handleName,
    email,
    password: plainTextPassword,
  } = req.body;

  // Email and Handlenamme could also validate via express-validator

  const userEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userEmail) {
    return res.status(400).json({ message: 'Email Already In Use.' });
  }

  const userHandlename = await prisma.user.findUnique({
    where: {
      handleName,
    },
  });

  if (userHandlename) {
    return res.status(400).json({ message: 'Handle Name Already In Use.' });
  }

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
