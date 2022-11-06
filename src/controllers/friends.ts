import { Request, Response } from 'express';
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
      conversationId: true,
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
