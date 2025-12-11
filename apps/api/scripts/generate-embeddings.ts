import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function createBusinessText(business: any): string {
  // Create searchable text from business data
  const parts = [
    `Name: ${business.name}`,
    business.description && `Description: ${business.description}`,
    business.address && `Address: ${business.address}`,
    business.phone && `Phone: ${business.phone}`,
    business.email && `Email: ${business.email}`,
    business.website && `Website: ${business.website}`,
    `Type: ${business.type}`,
    business.category?.name && `Category: ${business.category.name}`,
  ];
  
  return parts.filter(Boolean).join('. ');
}

async function embedAllBusinesses() {
  console.log('🚀 Starting embedding generation...');
  
  // Fetch all businesses with their categories
  const businesses = await prisma.business.findMany({
    include: {
      category: true,
    },
  });
  
  console.log(`📊 Found ${businesses.length} businesses to embed`);
  
  let processed = 0;
  let errors = 0;
  
  for (const business of businesses) {
    try {
      // Skip if already has embedding
      if (business.embedding) {
        console.log(`⏭️  Skipping ${business.name} (already embedded)`);
        processed++;
        continue;
      }
      
      // Create searchable text
      const text = createBusinessText(business);
      
      // Generate embedding
      const embedding = await generateEmbedding(text);
      
      // Store as JSON string
      await prisma.business.update({
        where: { id: business.id },
        data: {
          embedding: JSON.stringify(embedding),
        },
      });
      
      processed++;
      console.log(`✅ [${processed}/${businesses.length}] Embedded: ${business.name}`);
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errors++;
      console.error(`❌ Error embedding ${business.name}:`, error);
    }
  }
  
  console.log('\n📈 Summary:');
  console.log(`   Total businesses: ${businesses.length}`);
  console.log(`   Successfully processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
  console.log('✨ Done!');
}

// Run the script
embedAllBusinesses()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
