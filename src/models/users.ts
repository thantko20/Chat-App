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
      return await prismaUser.findUnique({
        where: {
          handleName,
        },
      });
    },

    async findUserWithId(id: string) {
      return await prismaUser.findUnique({
        where: {
          id,
        },
      });
    },

    async signUp(data: TUserSignUp) {
      return await prismaUser.create({
        data,
      });
    },

    sanitizeUser(user: User) {
      return excludeFields(user, 'password', 'salt');
    },
  });
}

export const userModel = Users(prisma.user);
