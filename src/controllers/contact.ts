import { NextFunction, Request, Response } from 'express';
import { prisma } from '../services/db';
import { excludeFields } from '../utils';

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;

    const contacts = await prisma.userContact.findMany({
      where: {
        fromUserId: userId,
      },
      include: {
        toUser: true,
      },
      orderBy: {
        toUser: {
          firstName: 'asc',
          lastName: 'asc',
        },
      },
    });

    const sanitizedContacts = contacts.map((contact) => ({
      ...contact,
      toUser: excludeFields(contact.toUser, 'password', 'salt'),
    }));

    return res.json({ data: sanitizedContacts });
  } catch (error) {
    next(error as Error);
  }
};

export const addContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const toUserId = req.params.userId;

    const contact = await prisma.userContact.create({
      data: {
        fromUserId: userId,
        toUserId: toUserId,
      },
      include: {
        toUser: true,
      },
    });

    const sanitizedContact = {
      ...contact,
      toUser: excludeFields(contact.toUser, 'password', 'salt'),
    };

    return res.json({ data: sanitizedContact });
  } catch (error) {
    next(error as Error);
  }
};
