import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

import authRouter from './routes/auth';
import friendsRouter from './routes/friends';
import { Socket } from 'socket.io';
import { prisma } from './services/db';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/friends', friendsRouter);

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello world');
});

io.use(async (socket, next) => {
  const userId: string = socket.handshake.auth.userId;

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (user) {
    socket.userId = user.id;
    return next();
  }

  console.log('User not found.');
  next(new Error('User not found.'));
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
