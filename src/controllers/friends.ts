import { NextFunction, Request, Response } from 'express';
import { prisma } from '../services/db';

export const getFriends = async (req: Request, res: Response) => {
  const friends = await prisma.friendship.findMany({
    where: {
      friendOfId: req.userId,
      status: 'FRIENDS',
    },
    select: {
      id: true,
      status: true,
      friendTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          handleName: true,
          profileImage: true,
        },
      },
    },
  });

  res.json({ data: friends });
};

export const addFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const friendId = req.params.id;

    const friendship = await prisma.friendship.create({
      data: {
        friendOfId: req.userId as string,
        friendToId: friendId,
        status: 'REQUEST_PENDING',
      },
    });

    res.json({ data: friendship });
  } catch (err) {
    if (err instanceof Error) {
      next(err);
    }
  }
};
