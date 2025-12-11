# AI-Powered Semantic Search для YellowBooks

Гүйцэтгэсэн: 2025.12.11

## 🎯 Үндсэн онцлогууд

### 1. **Vector Embeddings for Businesses**
- OpenAI `text-embedding-3-small` model ашиглан vector embeddings үүсгэнэ
- Бүх business-ийн нэр, тайлбар, хаяг, категори гэх мэт мэдээллийг embedding болгоно
- PostgreSQL database-д JSON string хэлбэрээр хадгална

### 2. **Semantic Search**
- Хэрэглэгчийн асуултыг embedding болгоно
- Cosine similarity ашиглан хамгийн ойролцоо business-үүдийг олно
- Top 10 бизнесийн жагсаалт буцаана

### 3. **AI-Generated Answers**
- GPT-4o-mini model ашиглан хэрэглэгчийн асуултанд монгол хэлээр хариулна
- Олдсон business-үүдийн мэдээлэл дээр үндэслэн хариулт үүсгэнэ
- Ойлгомжтой, товч хариулт өгнө

### 4. **Redis Caching**
- AI хайлтын үр дүнг 1 цагийн турш cache хийнэ
- API зардлыг бууруулна
- Хурдыг нэмэгдүүлнэ

## 🏗️ Технологийн Stack

- **OpenAI API**: text-embedding-3-small, gpt-4o-mini
- **Redis**: Caching layer
- **Prisma**: Database ORM
- **Fastify + tRPC**: Backend API
- **Next.js**: Frontend UI

## 📦 Installation

### 1. Install dependencies

```bash
cd apps/api
npm install openai redis
```

### 2. Environment Variables

**apps/api/.env:**
```env
DATABASE_URL="prisma+postgres://..."
OPENAI_API_KEY="sk-..."
REDIS_URL="redis://localhost:6379"  # Optional, defaults to localhost
```

**apps/workspace/.env.local:**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Database Migration

```bash
cd apps/api
npx prisma migrate deploy
```

### 4. Generate Embeddings

```bash
cd apps/api
npx tsx scripts/generate-embeddings.ts
```

**Note:** This will use OpenAI API to generate embeddings for all businesses. Cost: ~$0.0001 per business.

## 🚀 Usage

### API Endpoint

**tRPC Mutation: `aiSearch`**

```typescript
// Client-side usage
const result = await trpc.aiSearch.mutate({
  query: "Улаанбаатарт банк байна уу?"
});

// Response:
{
  answer: "Тийм, Улаанбаатарт...",
  businesses: [
    {
      id: 1,
      name: "Хаан Банк",
      description: "...",
      similarityScore: 0.89,
      ...
    }
  ],
  timestamp: "2025-12-11T..."
}
```

### UI Page

Access at: `/assistant`

Features:
- Natural language search in Mongolian
- AI-generated answers
- Business results with similarity scores
- Click-through to business details

## 📊 How It Works

```
User Query
    ↓
Generate Query Embedding (OpenAI)
    ↓
Calculate Cosine Similarity with all business embeddings
    ↓
Get Top 10 businesses
    ↓
Generate AI Answer with GPT-4o-mini
    ↓
Cache result in Redis (1 hour)
    ↓
Return to user
```

## 💰 Cost Estimation

### OpenAI API Costs

**Embedding Generation (one-time):**
- Model: text-embedding-3-small
- Cost: $0.00002 per 1K tokens
- Average business: ~100 tokens
- 100 businesses: ~$0.20

**Per Search:**
- Query embedding: $0.000002
- GPT-4o-mini response: $0.00015 per token (input) + $0.0006 per token (output)
- Average search: ~$0.002

**Monthly (1000 searches):**
- Without cache: ~$2.00
- With Redis cache (80% hit rate): ~$0.40

### Redis Costs

- Local development: Free
- Production (Redis Cloud): $0 (free tier 30MB) or ~$5/month

## 🔧 Configuration

### Embedding Model Options

Current: `text-embedding-3-small` (1536 dimensions)
- Cheaper, faster
- Good for most use cases

Alternative: `text-embedding-3-large` (3072 dimensions)
- More accurate
- 2x cost

### GPT Model Options

Current: `gpt-4o-mini`
- Fast and cheap
- Good quality

Alternative: `gpt-4o`
- Best quality
- 5x cost

## 🧪 Testing

### Test Embedding Script

```bash
cd apps/api
npx tsx scripts/generate-embeddings.ts
```

### Test API Endpoint

```bash
curl -X POST http://localhost:4000/trpc/aiSearch \
  -H "Content-Type: application/json" \
  -d '{"query":"банк хаана байна вэ"}'
```

### Manual Test Questions

- "Улаанбаатарт төрийн байгууллага хаана байдаг вэ?"
- "Мэдээллийн технологийн компани хайж байна"
- "Элчин сайдын яамны утас хэд вэ?"
- "Сүхбаатар дүүрэгт NGO байна уу?"

## 📈 Performance

- **Embedding generation**: ~1 second per business
- **Search query**: ~2-3 seconds (without cache)
- **Cached search**: <100ms
- **Database query**: <50ms

## 🔐 Security

- OpenAI API key must be kept secret (use environment variables)
- Redis should be password-protected in production
- Rate limiting recommended for AI endpoint

## 🚢 Deployment

### Kubernetes Setup

1. Add secrets:
```bash
kubectl create secret generic ai-secrets \
  --from-literal=OPENAI_API_KEY=sk-... \
  --from-literal=REDIS_URL=redis://redis-service:6379 \
  -n yellowbooks
```

2. Deploy Redis:
```bash
kubectl apply -f k8s/redis-deployment.yaml
```

3. Update backend deployment to use secrets

### Generate Embeddings in Production

```bash
# Run as one-time job
kubectl run embedding-job \
  --image=179459139528.dkr.ecr.us-east-1.amazonaws.com/workspace-api:latest \
  --restart=Never \
  --command -- npx tsx scripts/generate-embeddings.ts \
  -n yellowbooks
```

## 🐛 Troubleshooting

**Issue: "OPENAI_API_KEY not found"**
- Solution: Add to .env file

**Issue: "Redis connection failed"**
- Solution: Start Redis locally or update REDIS_URL

**Issue: "No embeddings found"**
- Solution: Run generate-embeddings.ts script first

**Issue: "Similarity scores all low"**
- Solution: Check if embeddings were generated correctly

## 📚 Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/caching/)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)

## 🎓 Learning Points

### Vector Search Concepts

1. **Embeddings**: Numerical representation of text that captures semantic meaning
2. **Cosine Similarity**: Measures angle between two vectors (0-1, higher = more similar)
3. **Semantic Search**: Finding results based on meaning, not just keywords

### Why This is Better Than Traditional Search

**Traditional (Keyword) Search:**
```
Query: "банк хаана байдаг"
Only finds: businesses with exact words "банк", "хаана"
```

**AI Semantic Search:**
```
Query: "банк хаана байдаг"
Finds: 
- Banks ("банк")
- Financial institutions ("санхүүгийн байгууллага")
- Credit unions (similar concept)
- Relevant addresses and locations
```

## 🔮 Future Improvements

- [ ] Support for multiple languages
- [ ] Voice search integration
- [ ] Image-based search
- [ ] Personalized recommendations
- [ ] Real-time business updates
- [ ] Advanced filters (distance, rating, etc.)
- [ ] Chat history and follow-up questions
- [ ] Analytics dashboard for popular queries

---

**Built with ❤️ using OpenAI, Redis, and Next.js**
