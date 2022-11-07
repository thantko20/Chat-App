import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

import authRouter from './routes/auth';
import friendsRouter from './routes/friends';
import { Socket } from 'socket.io';
import { prisma } from './services/db';
import { TDecodedToken } from './middleware/verifyToken';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});
app.set('socketIO', io);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/friends', friendsRouter);

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello world');
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.token;
  if (!token) {
    return next(new Error('Invalid Token.'));
  }

  jwt.verify(
    token as string,
    process.env.TOKEN_SECRET as string,
    (err, decoded) => {
      if (err) return next(err);
      const { userId } = decoded as TDecodedToken;

      socket.userId = userId;

      next();
    },
  );
});

io.on('connection', (socket: Socket) => {
  console.log('A user connected.');

  const userId = socket.userId as string;

  socket.emit('test', { userId });

  socket.join(userId);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
