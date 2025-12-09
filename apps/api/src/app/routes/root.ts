import { FastifyInstance } from 'fastify';
import CacheHandler from '../lib/cacheHandler';

const cache = new CacheHandler();
const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP;
const TTL_SECONDS = 60;
export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API fffff' };
  });

  // Health check endpoint for Kubernetes
  fastify.get('/api/health', async function () {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  async function fetchAndCache(key: string, url: string, tag: string) {
    const cached = await cache.get(key);
    const now = Date.now();
    const isStale = !cached || (cached.lastModified + TTL_SECONDS * 1000 < now);

    if (cached && !isStale) {
      return { value: cached.value, status: 'HIT' };
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      await cache.set(key, data, { tags: [tag] });

      return { value: data, status: cached ? 'STALE-REVALIDATED' : 'MISS' };
    } catch (err) {
      if (cached) return { value: cached.value, status: 'STALE' };
      throw err;
    }
  }

  fastify.get('/cached/businesses', async function (request, reply) {
    try {
      const { value, status } = await fetchAndCache(
        'all-businesses',
        `http://${SERVER_IP}/trpc/getAllBusinessesSimple`,
        'businesses'
      );
      reply.header('X-Cache', status);
      return value;
    } catch (err) {
      reply.code(500);
      return { error: 'Failed to fetch backend' };
    }
  });

  fastify.get('/cached/categories', async function (request, reply) {
    try {
      const { value, status } = await fetchAndCache(
        'all-categories',
        `http://${SERVER_IP}/trpc/getAllCategories`,
        'categories'
      );
      reply.header('X-Cache', status);
      return value;
    } catch (err) {
      reply.code(500);
      return { error: 'Failed to fetch backend' };
    }
  });
}
