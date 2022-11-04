import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/db';
import { comparePassword, genHashAndSalt } from '../services/bcrypt';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password: plainTextPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid Email.' });
  }

  const isPasswordValid = await comparePassword(
    plainTextPassword,
    user.password,
  );

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid Password.' });
  }

  jwt.sign(
    { userId: user.id },
    process.env.TOKEN_SECRET as string,
    { expiresIn: '14d' },
    (err, token) => {
      if (err) return next(err);

      res.json({
        token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          handleName: user.handleName,
          email: user.email,
          emailVerified: user.emailVerified,
          profileImage: user.profileImage,
          id: user.id,
        },
      });
    },
  );
};

export const register = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    handleName,
    email,
    password: plainTextPassword,
  } = req.body;

  // Email and Handlenamme could be also validated via express-validator

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

  const { password, salt } = await genHashAndSalt(plainTextPassword);

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
      profileImage: true,
    },
  });

  res.json({ data: newUser });
};
