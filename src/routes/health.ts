import { Router, Response } from 'express';
import client from '../services/elasticsearchClient';

const router = Router();

router.get('/', async (res: Response) => {
  try {
    const health = await client.cluster.health();
    return res.json({ status: 'OK', elasticsearch: health });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({ status: 'Error', error: error });
  }
});

export default router;
