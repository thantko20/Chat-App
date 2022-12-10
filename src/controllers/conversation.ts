import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';

type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
  };
}>;

const NUMBER_OF_MESSAGES_TO_FETCH = 20;

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
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
        excludeFields(participant, 'password', 'salt')
      );
      return { ...con, participants: participantsWithoutPassword };
    });

    res.json({ conversations: sanitizedConversations });
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cursor = req.query.cursor as any;

    const conversationId = req.params.id;
    let conversation: ConversationWithMessages | null;

    if (cursor) {
      conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: {
            take: NUMBER_OF_MESSAGES_TO_FETCH,
            skip: cursor ? 1 : 0,
            orderBy: {
              createdAt: 'desc',
            },
            cursor,
          },
        },
      });
    } else {
      conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: {
            take: NUMBER_OF_MESSAGES_TO_FETCH,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    const newCursor =
      conversation?.messages[NUMBER_OF_MESSAGES_TO_FETCH - 1].id;

    res.json({ conversation, cursor: newCursor });
  } catch (err) {
    next(err);
  }
};

export const getFriendConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const friendId = req.params.id as string;
    const { cursor = '' } = req.query;

    let conversation: ConversationWithMessages | null;

    if (cursor) {
      conversation = await prisma.conversation.findFirst({
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
            take: NUMBER_OF_MESSAGES_TO_FETCH,
            skip: 1,
            cursor: {
              id: cursor as string,
            },
          },
        },
      });
    } else {
      conversation = await prisma.conversation.findFirst({
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
            take: NUMBER_OF_MESSAGES_TO_FETCH,
          },
        },
      });
    }

    const messages = conversation?.messages ?? [];
    const newCursor =
      messages.length < NUMBER_OF_MESSAGES_TO_FETCH
        ? undefined
        : messages[NUMBER_OF_MESSAGES_TO_FETCH - 1].id;

    return res.json({ conversation, cursor: newCursor });
  } catch (error) {
    next(error);
  }
};
