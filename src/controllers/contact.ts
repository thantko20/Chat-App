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

    const contactExists = await prisma.userContact.findFirst({
      where: {
        fromUserId: userId,
        toUserId,
      },
    });

    if (contactExists) {
      return res.status(400).json({ message: 'Already in the contacts.' });
    }

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

export const removeContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contactId = req.params.contactId as string;

    const contact = await prisma.userContact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return res.status(400).json({ message: 'No Contact Found.' });
    }

    await prisma.userContact.delete({
      where: {
        id: contactId,
      },
    });

    res.redirect('/contacts');
  } catch (error) {
    next(error);
  }
};
