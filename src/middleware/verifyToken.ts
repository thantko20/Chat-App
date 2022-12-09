import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../services/db';

export interface ICustomPayload extends JwtPayload {
  userId: string;
}

export type TDecodedToken = ICustomPayload & string;

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    async (err, decoded) => {
      if (err || !decoded) return next(err);

      const { userId } = decoded as TDecodedToken;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User Not Authenticated.' });
      }

      req.userId = userId;

      next();
    }
  );
};

export default verifyToken;
