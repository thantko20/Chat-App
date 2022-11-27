import { Conversation } from '@prisma/client';
import { ok } from 'assert';
import { Server, Socket } from 'socket.io';
import { prisma } from '../services/db';
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

      io.to(toUserId).emit('conversation_update', { message: newMessage });
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
