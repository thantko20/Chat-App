import { Server, Socket } from 'socket.io';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';
import withHandlerWrapper from './withHanlderWrapper';

export interface IFindUsersPayload {
  handleName: string;
}

export default withHandlerWrapper(
  async ({ handleName }: IFindUsersPayload, socket: Socket, io: Server) => {
    try {
      if (!handleName) return;
      const users = await prisma.user.findMany({
        where: {
          handleName: {
            startsWith: handleName,
          },
        },
      });

      const sanitizedUsers = users.map((user) =>
        excludeFields(user, 'password', 'salt'),
      );
      socket.emit('find_users', { users: sanitizedUsers });
    } catch (err) {
      socket.emit('finding_users_error', {
        message: 'Error while finding users.',
      });
    }
  },
);
