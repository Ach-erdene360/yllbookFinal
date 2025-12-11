-- Complete YellowBooks Database Setup
-- Run this in Prisma Studio or any PostgreSQL client connected to your Accelerate database

-- Step 1: Create enum type
DO $$ BEGIN
    CREATE TYPE "public"."EntryType" AS ENUM ('BUSINESS', 'GOVERNMENT', 'NGO', 'EMBASSY', 'CONSULATE', 'PROVINCE', 'DISTRICT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create Category table
CREATE TABLE IF NOT EXISTS "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create Business table
CREATE TABLE IF NOT EXISTS "public"."Business" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    "links" JSONB,
    "description" TEXT,
    "image" TEXT,
    "password" TEXT,
    "type" "public"."EntryType" NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "public"."Category"("name");

-- Step 5: Add foreign key constraint
DO $$ BEGIN
    ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 6: Create _prisma_migrations table (required by Prisma)
CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Step 7: Record migrations as applied
INSERT INTO "public"."_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES 
    ('20250928091239', '20250928091239_init', '20250928091239_init', NOW(), 1),
    ('20251009084748', '20251009084748_init', '20251009084748_init', NOW(), 1)
ON CONFLICT ("id") DO NOTHING;

-- Step 8: Insert sample categories
INSERT INTO "public"."Category" ("name") VALUES
    ('Зочид буудал'),
    ('Ресторан'),
    ('Худалдаа'),
    ('Үйлчилгээ'),
    ('Боловсрол'),
    ('Эрүүл мэнд'),
    ('Технологи'),
    ('Санхүү'),
    ('Аялал жуулчлал'),
    ('Спорт')
ON CONFLICT ("name") DO NOTHING;

-- Step 9: Insert sample business
INSERT INTO "public"."Business" ("name", "phone", "email", "address", "website", "description", "type", "categoryId", "password")
VALUES (
    'Test Business',
    '+976-99887766',
    'test@yellowbooks.mn',
    'Ulaanbaatar, Mongolia',
    'https://example.com',
    'Test business for YellowBooks',
    'BUSINESS',
    1,
    'password123'
)
ON CONFLICT DO NOTHING;

-- Done! You can now use your application
SELECT 'Setup completed successfully! Tables created and seeded.' AS status;
