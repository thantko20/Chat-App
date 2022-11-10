import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

import authRouter from './routes/auth';
import friendsRouter from './routes/friends';
import conversationsrouter from './routes/conversations';
import { TDecodedToken } from './middleware/verifyToken';
import sendMessageHandler from './eventHandlers/sendMessageHandler';
import findUsersHandler from './eventHandlers/findUsersHandler';

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
app.use('/conversations', conversationsrouter);

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

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
