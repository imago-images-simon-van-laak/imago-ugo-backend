import client from './elasticsearchClient';
import redisClient from './cacheService';

export interface MediaRecord {
  id: string;
  title: string;
  description: string;
  datum?: string;
  suchtext?: string;
  [key: string]: any;
}

function normalizeMediaRecord(hit: any): MediaRecord {
  const source = hit._source || {};
  
  return {
    id: hit._id,
    title: source.title || 'Untitled',
    description: source.description || '',
    datum: source.datum || null,
    suchtext: source.suchtext || '',
    ...source                    
  };
}

export const searchMedia = async (
  keyword: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<MediaRecord[]> => {
  const cacheKey = `search:${keyword}:page:${page}:pageSize:${pageSize}`;
  
  try {
    const cachedResults = await redisClient.get(cacheKey);
    if (cachedResults) {
      return JSON.parse(cachedResults) as MediaRecord[];
    }
  } catch (cacheErr) {
    console.error('Error fetching from cache:', cacheErr);
  }
  
  try {
    const from = (page - 1) * pageSize;
    const mustQueries: any[] = [];

    if (keyword) {
      mustQueries.push({
        multi_match: {
          query: keyword,
          fields: ['title', 'description', 'suchtext']
        }
      });
    }

    const query = {
      from,
      size: pageSize,
      query: {
        bool: {
          must: mustQueries
        }
      }
    };

    const result = await client.search({
      index: 'imago',
      body: query
    });

    const hits = result.hits.hits;
    const mediaRecords: MediaRecord[] = hits.map((hit: any) => normalizeMediaRecord(hit));

    try {
      await redisClient.set(cacheKey, JSON.stringify(mediaRecords), { EX: 60 });
    } catch (cacheSetErr) {
      console.error('Error setting cache:', cacheSetErr);
    }

    return mediaRecords;
  } catch (error) {
    console.error('Error in searchMedia:', error);

    const fallbackResults = await redisClient.get(cacheKey);
    if (fallbackResults) {
      return JSON.parse(fallbackResults) as MediaRecord[];
    }
    throw error;
  }
};
