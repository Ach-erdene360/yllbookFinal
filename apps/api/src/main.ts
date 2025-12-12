import Fastify from 'fastify';
import cors from '@fastify/cors';
// import { app } from './app/app';
import { createContext } from './app/trcp/context';
import { appRouter, type AppRouter } from './app/trcp/router';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import cachedRoutes from './app/routes/root';

const host = '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = Fastify({
  logger: true,
  maxParamLength: 5000,
});

server.register(cachedRoutes);
server.register(cors, {
  origin: true, // Allow all origins (temporary fix for testing)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-trpc-source',
    'trpc-batch-mode',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
});

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
});

// server.register(app);

server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
