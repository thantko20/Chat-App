import { NextFunction, Request, Response } from 'express';
import { prisma } from '../services/db';

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error as Error);
  }
};
