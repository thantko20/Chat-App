import { PrismaClient } from '@prisma/client';
import { genHashAndSalt } from '../services/bcrypt';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';

export interface ISignup {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  handleName: string;
}
