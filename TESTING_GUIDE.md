# YellowBooks Feature Testing Guide

## 1. AI Semantic Search Features

### 1.1 Check Embedding Field (Database)
```bash
# Connect to database and check if embedding field exists
kubectl exec -n yellowbooks -l app=backend -- npx prisma studio
# Or via Prisma:
cd apps/api
npx prisma studio
# Navigate to Business model and check for 'embedding' column
```

### 1.2 Test Offline Embedding Script
```bash
# Set your OpenAI API key first
$env:OPENAI_API_KEY = "sk-your-key-here"
$env:DATABASE_URL = "your-database-url"

# Run the embedding generation script
cd apps/api
npx tsx scripts/generate-embeddings.ts

# Expected output:
# ✅ Processed 1/23: Business Name
# ✅ Successfully generated embeddings for 23 businesses
```

**What to verify:**
- Script processes all businesses
- No errors
- Database now has embeddings in Business.embedding field

### 1.3 Test AI Search Endpoint (Backend)
```bash
# Test via curl/Invoke-WebRequest
Invoke-WebRequest -Uri "http://ac97608da09fe413eb5808b6dee7baf5-898470353.us-east-1.elb.amazonaws.com/trpc/aiSearch" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"query":"банк хайж байна"}'
```

**Expected response:**
```json
{
  "result": {
    "data": {
      "answer": "AI generated answer in Mongolian...",
      "businesses": [...],
      "timestamp": "2025-12-11T..."
    }
  }
}
```

### 1.4 Test Redis Caching
```bash
# Start Redis locally
docker run -d -p 6379:6379 redis:7-alpine

# Or check if Redis is running
redis-cli ping
# Should return: PONG

# Search same query twice - second should be faster (cached)
# Check Redis keys:
redis-cli KEYS "ai:search:*"
```

### 1.5 Test Assistant UI Page
**URL:** http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/assistant

**What to test:**
1. ✅ Page loads without errors
2. ✅ Search input accepts Mongolian text
3. ✅ Example questions are shown
4. ✅ Submit a query: "Улаанбаатарт банк байна уу?"
5. ✅ AI answer appears in Mongolian
6. ✅ Business cards show with similarity scores
7. ✅ Loading state works
8. ✅ Error handling works (try without OpenAI key)

---

## 2. GitHub OAuth Authentication

### 2.1 Check GitHub OAuth Setup
**Visit:** https://github.com/settings/developers

**Verify:**
- OAuth App exists
- Callback URL: `http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/api/auth/callback/github`
- Client ID and Secret are saved

### 2.2 Test Login Flow
**URL:** http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/login

**Steps:**
1. Click "Login with GitHub"
2. Authorize on GitHub (first time)
3. Should redirect to homepage
4. Check if user name appears in header/profile

**Verify in database:**
```bash
cd apps/api
npx prisma studio
# Check tables:
# - User: Your GitHub account should be listed
# - Account: GitHub provider linked
# - Session: Active session exists
```

### 2.3 Check NextAuth Configuration
```bash
# Check environment variables
kubectl get pods -n yellowbooks -l app=frontend -o yaml | grep -A 10 "env:"

# Required env vars:
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - DATABASE_URL
```

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Check User Role in Database
```bash
cd apps/api
npx prisma studio

# Navigate to User table
# Check:
# - 'role' column exists (USER or ADMIN)
# - Admin user (admin@yellowbooks.mn) has role = ADMIN
```

### 3.2 Test Admin User
**Login as admin:**
- Email: admin@yellowbooks.mn
- Role: ADMIN

**After login, check session:**
```javascript
// Open browser console on frontend
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)

// Should show:
// {
//   "user": {
//     "email": "admin@yellowbooks.mn",
//     "role": "ADMIN"
//   }
// }
```

### 3.3 Test Protected Routes (Middleware)
**File:** `apps/workspace/src/middleware.ts`

**Test scenarios:**

1. **Not logged in + access /admin:**
   - Visit: http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/admin
   - Expected: Redirect to `/login`

2. **Logged in as USER + access /admin:**
   - Login with regular GitHub account
   - Visit: /admin
   - Expected: Redirect to `/` (homepage)

3. **Logged in as ADMIN + access /admin:**
   - Login with admin@yellowbooks.mn
   - Visit: /admin
   - Expected: Access granted

**Check middleware logs:**
```bash
kubectl logs -n yellowbooks -l app=frontend --tail=50 | grep -i "middleware\|auth"
```

### 3.4 Verify Role in Sign-in Callback
**File:** `apps/workspace/src/lib/auth.ts`

**What it does:**
- Auto-assigns ADMIN role to admin@yellowbooks.mn on first login
- Loads role from database on every sign-in

**Test:**
1. Clear database User table
2. Login with admin@yellowbooks.mn
3. Check database - role should be ADMIN

---

## 4. CSRF Protection (NextAuth Built-in)

### 4.1 Check NextAuth CSRF Token
```javascript
// Open browser console
document.cookie.split(';').find(c => c.includes('next-auth.csrf-token'))

// Should show token like:
// "next-auth.csrf-token=abc123..."
```

### 4.2 Test Protected Mutations
**NextAuth automatically:**
- Generates CSRF token on session creation
- Validates token on mutations
- Stores in HTTP-only cookie

**Manual test:**
```javascript
// Try API call without proper session cookie
fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com' })
})
// Should fail without valid CSRF token
```

---

## 5. Complete Feature Checklist

### AI Search (5 items)
- [ ] Embedding field exists in Business model
- [ ] Offline script generates embeddings successfully
- [ ] AI search endpoint returns results with GPT answers
- [ ] Redis caching works (2nd query faster)
- [ ] Assistant UI page functional

### Authentication (4 items)
- [ ] GitHub OAuth app configured
- [ ] Login/logout works
- [ ] Session persists across page refresh
- [ ] User data stored in database

### RBAC (3 items)
- [ ] User role column exists
- [ ] Admin user seeded with ADMIN role
- [ ] Middleware blocks non-admin from /admin routes

### Security
- [ ] NextAuth CSRF tokens working

---

## 6. Quick Test Commands

### Test Everything at Once
```bash
# 1. Check pods running
kubectl get pods -n yellowbooks

# 2. Test backend API
Invoke-WebRequest -Uri "http://ac97608da09fe413eb5808b6dee7baf5-898470353.us-east-1.elb.amazonaws.com/" | Select-Object StatusCode

# 3. Test frontend
Invoke-WebRequest -Uri "http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/" | Select-Object StatusCode

# 4. Check database connection
cd apps/api
npx prisma db pull

# 5. View logs
kubectl logs -n yellowbooks -l app=backend --tail=50
kubectl logs -n yellowbooks -l app=frontend --tail=50
```

### Environment Variables Check
```bash
# Frontend
kubectl exec -n yellowbooks -l app=frontend -- printenv | grep -E "NEXT|GITHUB|DATABASE"

# Backend
kubectl exec -n yellowbooks -l app=backend -- printenv | grep -E "REDIS|OPENAI|DATABASE"
```

---

## 7. Known Issues & Fixes

### Issue: "Business not found" on detail page
✅ **FIXED** - Using correct tRPC format: `input=22` instead of JSON encoding

### Issue: NextAuth session 500 error
✅ **FIXED** - Added `database-secret` with DATABASE_URL

### Issue: AI search crashes backend
✅ **FIXED** - Lazy-load OpenAI client, only initialize when needed

### Issue: SSR can't reach backend
✅ **FIXED** - Use internal `backend-service` URL for server-side rendering

---

## 8. Production Readiness

### Before going live:
- [ ] Change `NEXTAUTH_SECRET` to secure random string
- [ ] Set up production GitHub OAuth app
- [ ] Deploy Redis to Kubernetes
- [ ] Add `OPENAI_API_KEY` to secrets
- [ ] Run embedding generation on all businesses
- [ ] Set up monitoring/logging
- [ ] Configure domain name and HTTPS
- [ ] Review and remove debug logs

---

## URLs
- **Frontend:** http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com
- **Backend:** http://ac97608da09fe413eb5808b6dee7baf5-898470353.us-east-1.elb.amazonaws.com
- **AI Assistant:** http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/assistant
- **Login:** http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/login
