import { FastifyInstance } from 'fastify';
import CacheHandler from '../lib/cacheHandler';

const cache = new CacheHandler();

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API fffff' };
  });

  // Example cached endpoint that fetches business list from your backend once and caches it
  fastify.get('/cached/businesses', async function (request, reply) {
    const key = 'all-businesses';
    const cached = await cache.get(key);
    if (cached) {
      reply.header('X-Cache', 'HIT');
      return cached.value;
    }

    try {
      // Replace URL below with your real backend endpoint
      const res = await fetch('http://3.81.242.223:3001/trpc/getAllBusinessesSimple');
      const data = await res.json();

      // store raw result under the key; you can add tags in ctx if you want
      await cache.set(key, data, { tags: ['businesses'] });

      reply.header('X-Cache', 'MISS');
      return data;
    } catch (err) {
      reply.code(500);
      return { error: 'Failed to fetch backend' };
    }
  });
}
