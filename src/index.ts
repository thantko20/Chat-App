import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import cors from 'cors';

import authRouter from './routes/auth';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello world');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
