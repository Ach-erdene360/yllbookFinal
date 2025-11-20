import { FastifyInstance } from 'fastify';
import CacheHandler from '../lib/cacheHandler';

const cache = new CacheHandler();

export default async function (fastify: FastifyInstance) {
  // Root endpoint
  fastify.get('/', async function () {
    return { message: 'Hello API fffff' };
  });

  // Cached businesses endpoint
  fastify.get('/cached/businesses', async function (request, reply) {
    const key = 'all-businesses';
    const cached = await cache.get(key);
    if (cached) {
      reply.header('X-Cache', 'HIT');
      return cached.value;
    }

    try {
      const res = await fetch('http://3.81.242.223:3001/trpc/getAllBusinessesSimple');
      const data = await res.json();

      await cache.set(key, data, { tags: ['businesses'] });

      reply.header('X-Cache', 'MISS');
      return data;
    } catch (err) {
      reply.code(500);
      return { error: 'Failed to fetch backend' };
    }
  });

  // Cached categories endpoint
  fastify.get('/cached/categories', async function (request, reply) {
    const key = 'all-categories';
    const cached = await cache.get(key);
    if (cached) {
      reply.header('X-Cache', 'HIT');
      return cached.value;
    }

    try {
      const res = await fetch('http://3.81.242.223:3001/trpc/getAllCategories');
      const data = await res.json();

      await cache.set(key, data, { tags: ['categories'] });

      reply.header('X-Cache', 'MISS');
      return data;
    } catch (err) {
      reply.code(500);
      return { error: 'Failed to fetch backend' };
    }
  });
}

