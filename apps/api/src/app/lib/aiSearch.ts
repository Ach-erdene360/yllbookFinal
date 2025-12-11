import { createClient } from 'redis';
import OpenAI from 'openai';

// Redis client for caching
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  return redisClient;
}

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function searchBusinessesWithAI(query: string, prisma: any) {
  try {
    // Try to get from cache first
    const redis = await getRedisClient();
    const cacheKey = `ai:search:${query}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log('✅ Returning cached result for:', query);
      return JSON.parse(cached);
    }
    
    // Generate embedding for the query
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;
    
    // Get all businesses with embeddings
    const businesses = await prisma.business.findMany({
      where: {
        embedding: {
          not: null,
        },
      },
      include: {
        category: true,
      },
    });
    
    // Calculate similarity scores
    const results = businesses
      .map((business: any) => {
        const businessEmbedding = JSON.parse(business.embedding);
        const similarity = cosineSimilarity(queryEmbedding, businessEmbedding);
        
        return {
          id: business.id,
          name: business.name,
          description: business.description,
          address: business.address,
          phone: business.phone,
          email: business.email,
          website: business.website,
          type: business.type,
          category: business.category?.name,
          image: business.image,
          similarityScore: similarity,
        };
      })
      .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
      .slice(0, 10); // Top 10 results
    
    // Generate AI summary using GPT
    const topBusinesses = results.slice(0, 5);
    const businessList = topBusinesses
      .map((b: any, i: number) => 
        `${i + 1}. ${b.name} - ${b.description || 'No description'} (${b.category})`
      )
      .join('\n');
    
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for a Mongolian business directory. Answer questions about businesses in Mongolia in a friendly, concise manner. Always respond in the same language as the user query.',
        },
        {
          role: 'user',
          content: `User question: "${query}"\n\nRelevant businesses found:\n${businessList}\n\nProvide a helpful answer based on these businesses. Be concise and include specific business names.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    const answer = gptResponse.choices[0].message.content;
    
    const result = {
      answer,
      businesses: results,
      timestamp: new Date().toISOString(),
    };
    
    // Cache the result for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(result));
    
    return result;
    
  } catch (error) {
    console.error('AI search error:', error);
    throw error;
  }
}
