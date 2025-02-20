import { Router, Request, Response } from 'express';
import { searchMedia } from '../services/mediaService';
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const keyword = `${req.query.keyword}`;
    const page = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const pageSize = req.query.pageSize ? parseInt(`${req.query.pageSize}`) : 10;
    
    const { keyword: _k, page: _p, pageSize: _ps } = req.query;

    const results = await searchMedia(keyword, page, pageSize);

    return res.json({
      page,
      pageSize,
      total: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error during search:', error);
    return res.status(500).json({ message: 'An error occurred during search', error: error });
  }
});

export default router;
