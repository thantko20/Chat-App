import { prisma } from '../services/db';
import { NextFunction, Request, Response } from 'express';
import { excludeFields } from '../utils';
import { Conversation, Message, Prisma } from '@prisma/client';

type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
  };
}>;

const NUMBER_OF_MESSAGES_TO_FETCH = 20;

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

    res.json({ conversations: sanitizedConversations });
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
            cursor: cursor,
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

    console.log('Number of messages: ', conversation?.messages.length);

    res.json({ conversation: conversation, cursor: newCursor });
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
            cursor: cursor as any,
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
            take: 20,
          },
        },
      });
    }

    const messages = conversation?.messages ?? [];
    const lastMessageId = messages[messages.length - 1].id ?? '';

    const newCursor = lastMessageId;

    return res.json({ conversation, cursor: newCursor });
  } catch (error) {
    next(error);
  }
};
