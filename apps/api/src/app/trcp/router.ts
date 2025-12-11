import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { searchBusinessesWithAI } from '../lib/aiSearch';

export const t = initTRPC.create();

export const appRouter = t.router({
  getAllCategories: t.procedure.query(async () => {
    return prisma.category.findMany();
  }),

  getAllBusinessesSimple: t.procedure.query(async () => {
    return prisma.business.findMany({
      include: {
        category: true,
      },
    });
  }),

  getAllBusinesses: t.procedure
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.number().optional(),
        type: z.enum([
          'BUSINESS',
          'GOVERNMENT',
          'NGO',
          'EMBASSY',
          'CONSULATE',
          'PROVINCE',
          'DISTRICT',
        ]).optional(),
      }),
    )
    .query(async ({ input }) => {
      return prisma.business.findMany({
        where: {
          ...(input.search && {
            name: {
              contains: input.search,
              mode: 'insensitive',
            },
          }),
          ...(input.categoryId && {
            categoryId: input.categoryId,
          }),
          ...(input.type && { type: input.type }),
        },
        include: {
          category: true,
        },
      });
    }),

  createBusiness: t.procedure
    .input(
      z.object({
        name: z.string().min(3),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        website: z.string().url().optional(),
        links: z.any().optional(),
        image: z.string().optional(),
        password: z.string().optional(),
        description: z.string().optional(),
        type: z.enum([
          'BUSINESS',
          'GOVERNMENT',
          'NGO',
          'EMBASSY',
          'CONSULATE',
          'PROVINCE',
          'DISTRICT',
        ]),
        categoryId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.business.create({
        data: input,
      });
    }),

  getBusinessById: t.procedure.input(z.number()).query(async ({ input }) => {
    return prisma.business.findUnique({
      where: { id: input },
      include: { category: true },
    });
  }),
   loginBusiness: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const business = await prisma.business.findFirst({
        where: {
          email: input.email,
          password: input.password,
        },
        include: {
          category: true,
        },
      });

      if (!business) {
        throw new Error('Имэйл эсвэл нууц үг буруу');
      }

      return business;
    }),

  updateBusiness: t.procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(3).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        website: z.string().url().optional(),
        links: z.any().optional(),
        image: z.string().optional(),
        password: z.string().optional(),
        description: z.string().optional(),
        type: z.enum([
          'BUSINESS', 'GOVERNMENT', 'NGO', 'EMBASSY',
          'CONSULATE', 'PROVINCE', 'DISTRICT'
        ]).optional(),
        categoryId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.business.update({
        where: { id },
        data,
      });
    }),

  // AI-powered semantic search
  aiSearch: t.procedure
    .input(
      z.object({
        query: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ input }) => {
      return searchBusinessesWithAI(input.query, prisma);
    }),
});

export type AppRouter = typeof appRouter;