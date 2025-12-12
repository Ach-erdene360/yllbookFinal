# GitHub OAuth Алдаа Засах Заавар

## Асуудал
GitHub OAuth нэвтрэлт ажиллахгүй байна. Алдаа: `OAuthSignin`

## Шалтгаан
Kubernetes secret-д **placeholder** утга байна (жинхэнэ GitHub OAuth credentials биш).

```bash
# Одоогийн байдал:
kubectl get secret github-oauth-secret -n yellowbooks -o yaml
# → GITHUB_CLIENT_ID: placeholder
# → GITHUB_CLIENT_SECRET: placeholder
```

## Засах Алхмууд

### Алхам 1: GitHub OAuth App Үүсгэх

1. **GitHub Settings-руу орно:**
   ```
   https://github.com/settings/developers
   ```

2. **"New OAuth App" дарна**

3. **Дараах мэдээллийг бөглөнө:**
   ```
   Application name: YellowBooks Production
   Homepage URL: http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com
   Authorization callback URL: http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/api/auth/callback/github
   ```

4. **"Register application" дарна**

5. **"Generate a new client secret" дарна**

6. **Client ID болон Client Secret-ыг хуулж авна**

### Алхам 2: Kubernetes Secret Шинэчлэх

```powershell
# Хуучин secret устгах
kubectl delete secret github-oauth-secret -n yellowbooks

# Шинэ secret үүсгэх (ЖИНХЭНЭ УТГУУДАА ОРУУЛНА)
kubectl create secret generic github-oauth-secret `
  --from-literal=GITHUB_CLIENT_ID="Ov23li..." `
  --from-literal=GITHUB_CLIENT_SECRET="..." `
  -n yellowbooks
```

**Анхааруулга:** `Ov23li...` болон `...` -ыг өөрийн жинхэнэ утгуудаар солино!

### Алхам 3: Frontend Pod Restart Хийх

```bash
# Pod-ыг restart хийж шинэ secret авна
kubectl rollout restart deployment frontend -n yellowbooks

# Pod асахыг хүлээнэ (~30 секунд)
kubectl get pods -n yellowbooks -w
```

### Алхам 4: Шалгах

1. **Browser-д хандана:**
   ```
   http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/login
   ```

2. **"Sign in with GitHub" дарна**

3. **GitHub authorization page харагдах ёстой**

4. **"Authorize" дарвал нэвтэрнэ**

### Алхам 5: Admin Хэрэглэгч Тохируулах (Optional)

Хэрэв admin@yellowbooks.mn email-тэй GitHub account байвал автоматаар ADMIN role авна.

## Шалгах Командууд

```powershell
# Secret зөв утгатай эсэхийг шалгах
kubectl get secret github-oauth-secret -n yellowbooks -o jsonpath='{.data.GITHUB_CLIENT_ID}' | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

# Frontend pod logs шалгах
kubectl logs -l app=frontend -n yellowbooks --tail=50

# Frontend environment variables шалгах
kubectl exec -it $(kubectl get pod -l app=frontend -n yellowbooks -o jsonpath='{.items[0].metadata.name}') -n yellowbooks -- env | Select-String -Pattern "GITHUB"
```

## Түгээмэл Алдаанууд

### 1. Callback URL Таарахгүй Байна
**Алдаа:** `redirect_uri_mismatch`

**Шийдэл:**
- GitHub OAuth App settings-д очино
- Callback URL-ыг зөв эсэхийг шалгана:
  ```
  http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com/api/auth/callback/github
  ```

### 2. Client Secret Буруу Байна
**Алдаа:** `OAuthSignin` эсвэл `AccessDenied`

**Шийдэл:**
- Client Secret дахин generate хийнэ
- Secret-ыг дахин үүсгэнэ
- Pod restart хийнэ

### 3. NEXTAUTH_URL Буруу Байна
**Алдаа:** Redirect буцаж ирэхгүй байна

**Шалгах:**
```bash
kubectl get deployment frontend -n yellowbooks -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="NEXTAUTH_URL")].value}'
```

**Хүлээгдэж буй утга:**
```
http://afcbf65fe5d96481b90d1d5345fbd5a0-1445315699.us-east-1.elb.amazonaws.com
```

### 4. Database Холболт Алдаа
**Алдаа:** Session хадгалагдахгүй байна

**Шалгах:**
```bash
# Backend logs шалгах
kubectl logs -l app=backend -n yellowbooks --tail=100

# Database secret шалгах
kubectl get secret database-secret -n yellowbooks -o yaml
```

## Development-д Тест Хийх

Local машин дээр тест хийхийг хүсвэл:

1. **Port-forward хийнэ:**
   ```bash
   kubectl port-forward -n yellowbooks svc/frontend-service 3000:80
   kubectl port-forward -n yellowbooks svc/backend-service 4000:80
   ```

2. **GitHub OAuth App үүсгэнө (Dev):**
   ```
   Callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. **Local .env үүсгэнө:**
   ```bash
   # apps/workspace/.env.local
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-random-secret
   GITHUB_ID=your_dev_client_id
   GITHUB_SECRET=your_dev_client_secret
   DATABASE_URL=your_database_url
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. **Local ажиллуулна:**
   ```bash
   cd apps/workspace
   npm run dev
   ```

## Амжилттай Нэвтрэлт

Зөв тохируулсан бол:

1. ✅ `/login` дээр "Sign in with GitHub" button харагдана
2. ✅ Дарахад GitHub authorization page харагдана
3. ✅ Authorize дарвал YellowBooks homepage-руу буцаана
4. ✅ Хэрэглэгчийн нэр навигаци дээр харагдана
5. ✅ Database-д User, Account, Session бүртгэгдэнэ
6. ✅ admin@yellowbooks.mn email-тай бол `/admin` routes-д хандах боломжтой

## Нэмэлт Тохиргоо (Optional)

### Multiple Providers Нэмэх

Google OAuth нэмэхийг хүсвэл:

```typescript
// apps/workspace/src/lib/auth.ts
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({...}),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // ...
};
```

### Custom Sign-In Page

```typescript
// apps/workspace/src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  // ...
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
};
```

## Холбоо Барих

Асуудал үргэлжилвэл:
- GitHub Issues: https://github.com/Ach-erdene360/yllbookFinal/issues
- GITHUB_OAUTH_SETUP.md файлыг уншина уу
