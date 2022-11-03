import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello world');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
