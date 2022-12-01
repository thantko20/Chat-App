import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

import authRouter from './routes/auth';
import conversationsRouter from './routes/conversations';
import userRouter from './routes/user';
import contactRouter from './routes/contact';
import { TDecodedToken } from './middleware/verifyToken';
import sendMessageHandler from './eventHandlers/sendMessageHandler';
import findUsersHandler from './eventHandlers/findUsersHandler';

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('socketIO', io);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);
app.use('/users', userRouter);
app.use('/contacts', contactRouter);

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
  const userId = socket.userId as string;
  console.log('A user connected. UserID: ', userId);

  socket.join(userId);

  socket.on('send_message', sendMessageHandler(socket, io));

  socket.on('find_users', findUsersHandler(socket, io));

  socket.on('manual_disconnect', () => {
    socket.disconnect();
  });

  socket.on('disconnect', (reason) => {
    console.log(reason);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
