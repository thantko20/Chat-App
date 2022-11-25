import { NextFunction, Request, Response } from 'express';
import { Server } from 'socket.io';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';

export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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
        friendTo: true,
        friendOf: true,
      },
      orderBy: {
        friendTo: {
          firstName: 'asc',
        },
      },
    });

    const sanitizedFriendships = friends.map((friend) => ({
      ...friend,
      friendOf: excludeFields(friend.friendOf, 'password', 'salt'),
      friendTo: excludeFields(friend.friendTo, 'password', 'salt'),
    }));

    res.json({ data: sanitizedFriendships });
  } catch (err) {
    next(err as Error);
  }
};

export const addFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const friendId = req.params.id;

    const alreadyExists = await prisma.friendship.findFirst({
      where: {
        friendOfId: req.userId,
        friendToId: friendId,
      },
    });

    if (alreadyExists) {
      return res.status(400).json({
        message: 'Already friends.',
      });
    }

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

    const alreadyExists = await prisma.friendship.findFirst({
      where: {
        friendOfId: req.userId,
        friendToId: senderId,
      },
    });

    if (alreadyExists) {
      return res.status(400).json({ message: 'Already friends.' });
    }

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
