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
  ) => {
    if (!message || !toUserId) {
      socket.emit('send_emssage_error', {
        errorMessage: 'Error Sending Message.',
      });
    }

    const userId = socket.userId as string;

    const conversation = await prisma.conversation.upsert({
      where: {
        participantIds: [userId, toUserId],
      },
      update: {},
      create: {
        participantIds: [userId, toUserId],
      },
    });

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

    io.to([userId, toUserId]).emit('send_message', { message: newMessage });
  },
);
