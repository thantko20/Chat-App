import { Conversation } from '@prisma/client';
import { ok } from 'assert';
import { Server, Socket } from 'socket.io';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';
import withHandlerWrapper from './withHanlderWrapper';

export interface ISendMessagePayload {
  message: string;
  toUserId: string;
}

export default withHandlerWrapper(
  async (
    { message, toUserId }: ISendMessagePayload,
    socket: Socket,
    io: Server,
    ack,
  ) => {
    try {
      if (!message || !toUserId) {
        throw Error();
      }

      let conversation: Conversation | null;

      const userId = socket.userId as string;

      conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [userId, toUserId],
          },
        },
        // update: {},
        // create: {
        //   participantIds: [userId, toUserId],
        // },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participantIds: [userId, toUserId],
          },
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          text: message,
          senderId: userId,
          conversationId: conversation.id,
          conversationLastMessage: {
            connect: {
              id: conversation.id,
            },
          },
        },
      });

      ack &&
        ack({
          status: {
            ok: true,
          },
        });

      io.to([userId, toUserId]).emit('send_message', { message: newMessage });
      const updatedConversation = await prisma.conversation.findUnique({
        where: {
          id: newMessage.conversationId,
        },
        include: {
          lastMessage: true,
          participants: true,
        },
      });

      const sanitizedParticipants = updatedConversation?.participants.map(
        (participant) => excludeFields(participant, 'password', 'salt'),
      );

      const sanitizedConversation = {
        ...updatedConversation,
        participants: sanitizedParticipants,
      };

      io.to(toUserId).emit('conversation_update', {
        conversation: sanitizedConversation,
      });
    } catch {
      ack &&
        ack({
          status: {
            ok: false,
          },
        });
    }
  },
);
