import { searchMedia } from '../src/services/mediaService';
import client from '../src/services/elasticsearchClient';
import redisClient from '../src/services/cacheService';

jest.mock('../src/services/elasticsearchClient');
jest.mock('../src/services/cacheService');

describe('searchMedia', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return results based on keyword search', async () => {
    const dummyHits = [
      {
        _id: '1',
        _source: {
          title: 'Test Title',
          description: 'Test Description',
          db: 'stock'
        }
      }
    ];
    (client.search as jest.Mock).mockResolvedValue({ hits: { hits: dummyHits } });
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    const results = await searchMedia('Test', 1, 10);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
    expect(results[0].title).toBe('Test Title');
  });

  it('should handle missing fields gracefully', async () => {
    const fakeHits = [
      {
        _id: '3',
        _source: {}
      }
    ];
    (client.search as jest.Mock).mockResolvedValue({ hits: { hits: fakeHits } });
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    const results = await searchMedia('whatever', 1, 10);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Untitled');
    expect(results[0].description).toBe('');
    expect(results[0].suchtext).toBe('');
  });

  it('should fallback to stale cache on ES error', async () => {
    const staleResults = [
      { id: 'stale', title: 'Stale Title', description: 'Stale Desc' }
    ];

    (client.search as jest.Mock).mockRejectedValue(new Error('ES Down'));
    (redisClient.get as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify(staleResults));

    const results = await searchMedia('fail', 1, 10);
    expect(results).toEqual(staleResults);
  });
});
