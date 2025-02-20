import express, { Response } from 'express';
import cors from 'cors';
import searchRouter from './routes/search';
import healthRouter from './routes/health';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/search', searchRouter);
app.use('/health', healthRouter);

app.get('/', (_, res) => {
  res.send('Media Search API is running.');
});

app.use((err: any, res: Response) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app;
