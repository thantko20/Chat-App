import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/db';
import { comparePassword, genHashAndSalt } from '../services/bcrypt';
import { excludeFields } from '../utils';
import { userModel } from '../models/users';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password: plainTextPassword } = req.body;

    const user = await userModel.findUserWithEmail(email);

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
          data: {
            token,
            user: userModel.sanitizeUser(user),
          },
        });
      },
    );
  } catch (err) {
    next(err as Error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    firstName,
    lastName,
    handleName,
    email,
    password: plainTextPassword,
  } = req.body;
  try {
    // Email and Handlenamme could be also validated via express-validator

    const userEmail = await userModel.findUserWithEmail(email);

    if (userEmail) {
      return res.status(400).json({ message: 'Email Already In Use.' });
    }

    const userHandlename = await userModel.findUserWithHandleName(handleName);

    if (userHandlename) {
      return res.status(400).json({ message: 'Handle Name Already In Use.' });
    }

    const { password, salt } = await genHashAndSalt(plainTextPassword);

    const newUser = await userModel.signUp({
      firstName,
      lastName,
      handleName,
      email,
      emailVerified: true,
      password,
      salt,
    });

    res.json({ data: excludeFields(newUser, 'password', 'salt') });
  } catch (err) {
    next(err as Error);
  }
};

export const getAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userModel.findUserWithId(req.userId as string);

    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
    }

    res.json({ data: userModel.sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};
