import { prisma } from '../services/db';
import { NextFunction, Request, Response } from 'express';
import { excludeFields } from '../utils';
import { Conversation } from '@prisma/client';

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: req.userId,
        },
      },
      include: {
        participants: true,
        lastMessage: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const sanitizedConversations = conversations.map((con) => {
      const participantsWithoutPassword = con.participants.map((participant) =>
        excludeFields(participant, 'password', 'salt'),
      );
      return { ...con, participants: participantsWithoutPassword };
    });

    res.json({ data: sanitizedConversations });
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversationId = req.params.id;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    res.json({ data: conversation });
  } catch (err) {
    next(err);
  }
};

export const getFriendConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const friendId = req.params.id as string;

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [req.userId as string, friendId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return res.json({ data: conversation });
  } catch (error) {
    next(error);
  }
};
