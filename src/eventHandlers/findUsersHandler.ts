import { Server, Socket } from 'socket.io';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';
import withHandlerWrapper from './withHandlerWrapper';

export interface IFindUsersPayload {
  handleName: string;
}

export default withHandlerWrapper(
  async (
    { handleName }: IFindUsersPayload,
    socket: Socket,
    io: Server,
    ack
  ) => {
    try {
      if (!handleName) {
        socket.emit('find_users', { users: [] });
        if (ack) {
          ack({
            status: {
              ok: true,
            },
          });
        }
        return;
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              handleName: {
                startsWith: handleName,
                mode: 'insensitive',
              },
            },
          ],

          NOT: {
            id: socket.userId,
          },
        },
        include: {
          toUsers: {
            select: {
              fromUserId: true,
            },
          },
        },
      });

      const usersWithContactStatus = users.map((user) => {
        const isInReqUserContacts = Boolean(
          user.toUsers.find((toUser) => toUser.fromUserId === socket.userId)
        );

        return {
          ...excludeFields(user, 'toUsers', 'password', 'salt'),
          isInReqUserContacts,
        };
      });

      socket.emit('find_users', { users: usersWithContactStatus });
      if (ack) {
        ack({
          status: {
            ok: true,
          },
        });
      }
    } catch (err) {
      socket.emit('finding_users_error', {
        message: 'Error while finding users.',
      });
    }
  }
);
