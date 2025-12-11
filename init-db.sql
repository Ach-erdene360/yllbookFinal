-- YellowBooks Database Schema
-- Generated from Prisma schema

-- Create enum type
CREATE TYPE "EntryType" AS ENUM ('BUSINESS', 'GOVERNMENT', 'NGO', 'EMBASSY', 'CONSULATE', 'PROVINCE', 'DISTRICT');

-- Create Category table
CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Business table
CREATE TABLE "Business" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(100),
    "email" VARCHAR(255),
    "address" TEXT,
    "website" VARCHAR(500),
    "links" JSONB,
    "description" TEXT,
    "image" VARCHAR(500),
    "password" VARCHAR(255),
    "type" "EntryType" NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Business_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "Business_categoryId_idx" ON "Business"("categoryId");

-- Insert sample categories
INSERT INTO "Category" ("name") VALUES
    ('Зочид буудал'),
    ('Ресторан'),
    ('Худалдаа'),
    ('Үйлчилгээ'),
    ('Боловсрол'),
    ('Эрүүл мэнд'),
    ('Технологи'),
    ('Санхүү'),
    ('Аялал жуулчлал'),
    ('Спорт');
