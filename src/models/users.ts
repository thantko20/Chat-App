import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';

type TUserSignUp = {
  firstName: string;
  lastName: string;
  handleName: string;
  email: string;
  emailVerified: boolean;
  password: string;
  salt: string;
  profileImage?: string;
};

export function Users(prismaUser: PrismaClient['user']) {
  return Object.assign(prismaUser, {
    async findUserWithEmail(email: string) {
      const user = await prismaUser.findUnique({
        where: {
          email,
        },
      });
      return user;
    },

    async findUserWithHandleName(handleName: string) {
      const user = await prismaUser.findUnique({
        where: {
          handleName,
        },
      });
      return user;
    },

    async findUserWithId(id: string) {
      const user = await prismaUser.findUnique({
        where: {
          id,
        },
      });
      return user;
    },

    async signUp(data: TUserSignUp) {
      const user = await prismaUser.create({
        data,
      });
      return user;
    },

    sanitizeUser(user: User) {
      return excludeFields(user, 'password', 'salt');
    },
  });
}

export const userModel = Users(prisma.user);
