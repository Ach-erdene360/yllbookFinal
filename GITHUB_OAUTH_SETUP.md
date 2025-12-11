# GitHub OAuth Setup for YellowBooks

## Step 1: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: YellowBooks Dev
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Click "Register application"
5. Click "Generate a new client secret"
6. Copy both the **Client ID** and **Client secret**

## Step 2: Add Environment Variables

Create or update `apps/workspace/.env.local` with:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here-generate-with-openssl-rand-base64-32

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# Database (Prisma)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

## Step 3: Update Type Definitions

Create `apps/workspace/src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}
```

## Step 4: Run Database Migration

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

This will:
- Create User, Account, Session, and VerificationToken tables
- Seed an admin user with email: `admin@yellowbooks.mn`

## Step 5: Update Login Page

Update `apps/workspace/src/app/login/page.tsx` to include GitHub login:

```typescript
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-bold">Sign In</h2>
        
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white hover:bg-gray-700"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
```

## Step 6: Add Session Provider

Update `apps/workspace/src/app/layout.tsx`:

```typescript
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

## Step 7: Protect Admin Routes

Admin routes are automatically protected by the middleware in `src/middleware.ts`.

To create an admin page:

```typescript
// apps/workspace/src/app/admin/page.tsx
import { requireAdmin } from "@/lib/getServerSession";

export default async function AdminPage() {
  const session = await requireAdmin(); // Throws if not admin

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>
    </div>
  );
}
```

## Testing

1. **Start the dev server**: `nx serve workspace`
2. **Visit**: http://localhost:3000/login
3. **Click "Sign in with GitHub"**
4. **Authorize the app**
5. **First-time users** will be created with role `USER`
6. **admin@yellowbooks.mn** will automatically get `ADMIN` role

## Production Setup

For production (EKS deployment):

1. Update GitHub OAuth callback URL to your production domain:
   - https://your-domain.com/api/auth/callback/github

2. Update environment variables in Kubernetes:
```bash
kubectl create secret generic nextauth-secrets \
  --from-literal=NEXTAUTH_URL=https://your-domain.com \
  --from-literal=NEXTAUTH_SECRET=<your-production-secret> \
  --from-literal=GITHUB_ID=<your-github-id> \
  --from-literal=GITHUB_SECRET=<your-github-secret> \
  -n yellowbooks
```

3. Update `k8s/frontend-deployment.yaml` to mount these secrets as env vars.

## Role-Based Access Control (RBAC)

### Server-Side (SSR):
```typescript
import { requireAdmin } from "@/lib/getServerSession";

export default async function AdminPage() {
  await requireAdmin(); // Redirects if not admin
  // Admin-only content
}
```

### Client-Side:
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();

  if (session?.user?.role === "ADMIN") {
    return <AdminControls />;
  }

  return <RegularContent />;
}
```

## CSRF Protection

NextAuth includes built-in CSRF protection for its routes (`/api/auth/*`).

For custom API routes that modify data, add CSRF token validation or use NextAuth's session verification:

```typescript
// apps/workspace/src/app/api/admin/delete/route.ts
import { getServerSession } from "@/lib/getServerSession";

export async function DELETE(request: Request) {
  const session = await getServerSession();
  
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Proceed with deletion
}
```

## Troubleshooting

**Issue**: "Cannot find module @prisma/client"
- Run: `cd apps/api && npx prisma generate`

**Issue**: GitHub OAuth redirect fails
- Check callback URL matches exactly in GitHub settings
- Verify NEXTAUTH_URL is correct

**Issue**: Role not appearing in session
- Check database User table has `role` column
- Verify migration ran successfully
- Sign out and sign in again

## Admin User Credentials

- Email: `admin@yellowbooks.mn`
- Sign in via GitHub using this email to get ADMIN role automatically
