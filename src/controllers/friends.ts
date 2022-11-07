import { NextFunction, Request, Response } from 'express';
import { Server } from 'socket.io';
import { prisma } from '../services/db';

export const getFriends = async (req: Request, res: Response) => {
  const friends = await prisma.friendship.findMany({
    where: {
      friendOfId: req.userId,
      OR: [
        {
          status: 'FRIENDS',
        },
        {
          status: 'REQUEST_PENDING',
        },
      ],
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
      friendOf: {
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

export const acceptFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const friendshipId = req.params.id;
    const io = req.app.get('socketIO') as Server;

    // Update the friend request sender's document
    const senderFriendship = await prisma.friendship.update({
      where: {
        id: friendshipId,
      },
      data: {
        status: 'FRIENDS',
      },
    });

    const senderId = senderFriendship.friendOfId;

    // Create a new document for the current user (receiver)
    const userFriendship = await prisma.friendship.create({
      data: {
        status: 'FRIENDS',
        friendOfId: req.userId as string,
        friendToId: senderId,
      },
    });

    const senderFriends = await prisma.friendship.findMany({
      where: {
        friendOfId: senderId,
        OR: [
          {
            status: 'FRIENDS',
          },
          {
            status: 'REQUEST_PENDING',
          },
        ],
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

    io.to(userFriendship.friendToId as string).emit('friend_accepted', {
      friends: senderFriends,
    });

    res.redirect('/friends');
  } catch (err) {
    next(err as Error);
  }
};
