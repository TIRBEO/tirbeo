# Multi-Tenant SaaS Platform with Subdomain Routing & Centralized SSO

## 1. Overview

### 1.1 Problem Statement
A landing page already exists at `example.com`. The next phase requires a unified platform where authentication, dashboard, and future product modules (mail, drive, workspace‑style apps) all share one login system and one database — architecturally similar to how Google routes `mail.google.com`, `drive.google.com`, etc. under a single identity layer.

### 1.2 Goal
Build one unified Next.js application (not several disconnected apps) that:
- Routes requests based on subdomain via middleware
- Authenticates users once at `accounts.example.com`
- Persists that session across every subdomain under `.example.com`
- Resolves per‑user **workspaces** (tenant slugs) as subdomains (`alice.example.com`)
- Scales toward millions of users without re‑architecture

### 1.3 Non‑Goals (v1)
- Building the actual "mail," "drive," etc. product modules — only the routing/auth/tenant skeleton that lets them plug in later
- Payment/billing (deferred to a later phase)
- Mobile apps / native clients
- Real‑time collaboration features

## 2. Success Criteria

| Metric | Target |
|---|---|
| Single sign‑in works across all subdomains without re‑auth | 100% of session‑valid requests |
| Cold subdomain → workspace resolution | < 50 ms added latency (DB/cache lookup) |
| Auth endpoints protected against brute force | Rate‑limited, no successful automated credential stuffing in test |
| Zero cross‑tenant data leakage | Verified via tenant‑isolation test suite |
| System supports arbitrary new subdomains without code redeploy for new tenants | New workspace signup → subdomain live immediately |

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Middleware support, edge runtime, Vercel‑native |
| Language | TypeScript | Type safety across shared auth/tenant logic |
| Database | PostgreSQL | Relational integrity for User/Workspace/Membership |
| ORM | Prisma | Type‑safe queries, migration management |
| Auth | Custom JWT + httpOnly secure cookies (session table in DB for revocation) | NextAuth adds abstraction that complicates cross‑subdomain cookie domain control and workspace‑aware sessions; a custom implementation gives full control over `Domain=.example.com`, revocation, and multi‑tenant claims |
| Password hashing | Argon2id | Stronger memory‑hardness than bcrypt against GPU cracking |
| Deployment | Vercel | Edge middleware, wildcard domain support |
| Rate limiting | Upstash Redis (or Vercel KV) sliding window | Serverless‑compatible, no persistent server needed |

**Note on auth choice:** NextAuth is viable but its session/cookie model is opinionated toward single‑domain apps. Since this system needs one session valid across N subdomains plus workspace‑scoped context embedded in the token, a thin custom JWT layer (using `jose` for signing) sitting on top of a `Session` table (for revocation/logout‑everywhere) gives more control with roughly the same amount of code NextAuth's adapter config would need anyway.

## 4. System Architecture

### 4.1 High‑Level Diagram
```
Request → example.com/*, accounts.example.com/*, alice.example.com/*, apps.example.com/*
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Edge Middleware   │
                    │  (subdomain parse)  │
                    └─────────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              ▼               ▼                   ▼
        no subdomain    accounts.*          {slug}.* / dashboard.* / apps.*
              │               │                   │
              ▼               ▼                   ▼
        /app/(marketing)  /app/(auth)      /app/(tenant)/[subdomain]
                                                    │
                                        session validated? ──No──► redirect
                                                    │                to accounts.*
                                                   Yes                with ?next=
                                                    │
                                        workspace resolved from slug
                                                    │
                                        render module with {user, workspace, role}
```

### 4.2 Core Principle
**Subdomains are a routing concern only — not separate deployments.** One Next.js app, one build, one Prisma client, one database. Middleware rewrites the request internally to the correct route group based on host header. This is what makes it "ONE unified system" per the requirement — there is no service boundary between "accounts app" and "dashboard app"; they're route groups inside `/app`.

### 4.3 Domain Types Resolved by Middleware

| Host pattern | Resolves to | Auth required? |
|---|---|---|
| `example.com`, `www.example.com` | Marketing/landing route group | No |
| `accounts.example.com` | Auth route group (login/signup/logout) | No (this *is* the auth surface) |
| `dashboard.example.com` | Global authenticated dashboard (workspace picker if user has >1) | Yes |
| `{workspace‑slug}.example.com` | Tenant route group, workspace context injected | Yes |
| `apps.example.com` (future) | Placeholder for cross‑workspace app launcher | Yes |
| Unrecognized subdomain | 404 or redirect to marketing | — |

## 5. Data Model (Prisma Schema)
```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  sessions       Session[]
  memberships    Membership[]
  ownedWorkspaces Workspace[] @relation("WorkspaceOwner")

  @@index([email])
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique  // used as subdomain, e.g. "alice" -> alice.example.com
  ownerId   String
  owner     User     @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships Membership[]

  @@index([slug])
}

model Membership {
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  role        Role     @default(MEMBER)
  createdAt   DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([workspaceId])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique  // hashed opaque token or JWT jti, never store raw JWT
  expiresAt DateTime
  createdAt DateTime @default(now())
  userAgent String?
  ipAddress String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}

enum Role {
  ADMIN
  MEMBER
}
```
**Design notes:**
- `Session.token` stores a hash of the session identifier (not the JWT itself), so a leaked DB dump doesn't yield usable tokens.
- The JWT cookie carries `{ sub: userId, sid: sessionId, iat, exp }` only — no workspace claims baked in, since a user's workspace memberships can change without requiring re‑login. Workspace/role is resolved fresh per‑request from `Membership`.
- `onDelete: Cascade` on Membership/Session ensures no orphaned rows when a user is deleted.

## 6. Authentication & Session Design

### 6.1 Cookie Configuration
```
Name:      __session
Domain:    .example.com        // leading dot = shared across all subdomains
Path:      /
HttpOnly:  true
Secure:    true                // HTTPS only, required in production
SameSite:  Lax                 // Lax allows top‑level nav from accounts.* to dashboard.*
Max-Age:   configurable (e.g., 7 days sliding, or 30 days remember‑me)
```
`SameSite=Lax` (not `Strict`) is required here — `Strict` would block the cookie from being sent when a user is redirected from `accounts.example.com` to `dashboard.example.com` via a top‑level navigation immediately after login.

### 6.2 Token Format
JWT signed with `HS256` (or `EdDSA` if you want asymmetric — recommended once you have >1 verifying service):
```json
{
  "sub": "user_cuid",
  "sid": "session_cuid",
  "iat": 1735900000,
  "exp": 1736504800
}
```

### 6.3 Auth Flow
**Signup** (`POST accounts.example.com/api/auth/signup`)
1. Validate email format + password strength
2. Check email uniqueness
3. Hash password with Argon2id
4. Create `User` row
5. Create `Session` row + sign JWT
6. Set `__session` cookie, domain `.example.com`
7. Redirect to `dashboard.example.com` (or `?next=` param)

**Login** (`POST accounts.example.com/api/auth/login`)
1. Rate limit check (see §8.2) by IP + email
2. Look up user by email
3. Verify password with Argon2 constant‑time compare
4. Create `Session` row, sign JWT
5. Set cookie, redirect

**Logout** (`POST /api/auth/logout`, callable from any subdomain)
1. Read `sid` from JWT
2. Delete corresponding `Session` row (server‑side revocation)
3. Clear cookie (`Max‑Age=0`, same `Domain=.example.com`)

**Session validation (every protected request)**
1. Read `__session` cookie
2. Verify JWT signature + expiry
3. Look up `Session.id == sid` in DB — if missing/expired, treat as logged out (this is what makes "logout everywhere" and remote revocation possible; a pure stateless JWT can't do this)
4. Attach `userId` to request context

### 6.4 Why DB‑Backed Sessions Instead of Pure Stateless JWT
A pure stateless JWT can't be revoked before expiry — if a laptop is stolen, you can't force logout. Checking `Session` table on each request costs one indexed lookup (~1‑2 ms) but buys you real logout, "log out all devices," and admin‑forced session termination. This is a standard trade‑off; for a system meant to scale to millions of users, a cached lookup (Redis in front of Postgres) keeps this cheap — see §9.

## 7. Middleware Implementation
```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/jwt';

const ROOT_DOMAIN = 'example.com';
const RESERVED_SUBDOMAINS = ['accounts', 'dashboard', 'apps', 'www', 'api'];

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const subdomain = extractSubdomain(host, ROOT_DOMAIN);

  // 1. No subdomain -> marketing site
  if (!subdomain) {
    return NextResponse.next();
  }

  // 2. accounts.example.com -> auth module, no session required
  if (subdomain === 'accounts') {
    const url = req.nextUrl.clone();
    url.pathname = `/accounts${req.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. All other subdomains require a valid session
  const sessionCookie = req.cookies.get('__session')?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  if (!session) {
    const loginUrl = new URL(`https://accounts.${ROOT_DOMAIN}/login`);
    loginUrl.searchParams.set('next', `https://${host}${req.nextUrl.pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  // 4. dashboard.example.com -> global authenticated dashboard
  if (subdomain === 'dashboard') {
    const url = req.nextUrl.clone();
    url.pathname = `/dashboard${req.nextUrl.pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set('x-user-id', session.userId);
    return res;
  }

  // 5. Reserved future subdomains (apps.example.com etc.)
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}${req.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 6. Otherwise treat subdomain as a workspace slug -> tenant route group
  const url = req.nextUrl.clone();
  url.pathname = `/tenant/${subdomain}${req.nextUrl.pathname}`;
  const res = NextResponse.rewrite(url);
  res.headers.set('x-user-id', session.userId);
  res.headers.set('x-workspace-slug', subdomain);
  return res;
}

function extractSubdomain(host: string, rootDomain: string): string | null {
  const hostWithoutPort = host.split(':')[0];
  if (hostWithoutPort === rootDomain || hostWithoutPort === `www.${rootDomain}`) {
    return null;
  }
  if (!hostWithoutPort.endsWith(`.${rootDomain}`)) {
    // localhost dev fallback, or unknown domain
    return null;
  }
  return hostWithoutPort.replace(`.${rootDomain}`, '');
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```
**Important:** actual workspace *existence* validation (does this slug correspond to a real workspace, is the user a member) happens in the route handler / layout, not middleware — middleware only decides *routing*; a lightweight `layout.tsx` in `/app/tenant/[slug]` does the authoritative DB check (with caching, see §9).

## 8. Folder Structure
```
/app
  /(marketing)              # example.com
    page.tsx
    layout.tsx
  /accounts                 # accounts.example.com
    /login
      page.tsx
    /signup
      page.tsx
    /api
      /auth
        /login/route.ts
        /signup/route.ts
        /logout/route.ts
        /session/route.ts    # GET current session, for client‑side checks
  /dashboard                 # dashboard.example.com
    layout.tsx               # validates session, fetches user's workspaces
    page.tsx                 # workspace picker / global home
  /tenant
    /[slug]                  # {workspace}.example.com
      layout.tsx             # resolves workspace by slug, checks membership, injects context
      page.tsx
      /settings/page.tsx
      /members/page.tsx
  /api
    /workspaces
      /route.ts              # create workspace (POST), list (GET)
      /[id]/route.ts
    /health/route.ts

/lib
  /auth
    jwt.ts                  # sign/verify
    password.ts             # argon2 hash/verify
    session.ts              # createSession, revokeSession, getSessionUser
    rate-limit.ts
  /db
    prisma.ts               # singleton client
  /tenant
    resolve.ts              # resolveWorkspaceBySlug (cached)
  /middleware-helpers
    subdomain.ts

/prisma
  schema.prisma
  /migrations

middleware.ts
```

## 9. Scalability Considerations
| Concern | Approach |
|---|---|
| Session lookups on every request | Cache `Session` validity in Redis (Upstash) with TTL matching token expiry; fall back to Postgres on cache miss |
| Workspace slug resolution on every tenant request | Cache `slug -> workspaceId` mapping in Redis; invalidate on workspace rename |
| DB connection exhaustion in serverless | Use Prisma with a connection pooler (PgBouncer, or Neon/Supabase's built‑in pooling) since each serverless invocation opens a new connection |
| Auth endpoint abuse | Rate limit by IP+email composite key using a sliding window counter in Redis |
| Millions of users / workspaces | Index `Workspace.slug` and `User.email` (already unique + indexed above); consider read replicas for workspace lookups once read volume grows |
| Wildcard subdomains on Vercel | Configure `*.example.com` as a wildcard domain in Vercel project settings; DNS wildcard `CNAME *.example.com -> cname.vercel-dns.com` |

## 10. Security Requirements
- **httpOnly, Secure, SameSite=Lax cookies** scoped to `.example.com`
- **Argon2id password hashing** (memory cost tuned per deployment hardware — do not use defaults blindly, benchmark for ~250 ms hash time)
- **CSRF protection**: since cookies are used for auth, mutating endpoints (`POST/PUT/DELETE`) validate an `Origin`/`Referer` header against an allowlist of `*.example.com`, or use a double‑submit CSRF token for form‑based flows
- **Rate limiting** on `/api/auth/login` and `/api/auth/signup` (e.g., 5 attempts / 15 min per IP+email)
- **Session revocation** via DB‑backed session table (see §6.4)
- **Tenant isolation**: every tenant‑scoped Prisma query must filter by `workspaceId` derived from the authenticated membership check — never trust a `workspaceId` passed directly from client input without verifying membership first
- **Generic error messages** on login failure ("invalid email or password" — never reveal which field was wrong)
- **(Future)** 2FA (TOTP) as a Phase 2 addition
- **(Future)** email verification on signup before granting full access

## 11. Phased Rollout
**Phase 1 — Foundation (this PRD's scope)**
- Middleware subdomain routing (marketing / accounts / dashboard / tenant)
- Signup, login, logout, session validation
- Workspace creation + slug‑based subdomain resolution
- Membership + role model
- Core security hardening (cookies, hashing, rate limiting, CSRF)

**Phase 2**
- Email verification, password reset flow
- Workspace invitations (invite‑by‑email flow, pending membership)
- Admin role permissions (who can invite/remove members, rename workspace)
- Redis caching layer for session + slug lookups

**Phase 3**
- First real product module under a subdomain (e.g., `apps.example.com` launcher)
- 2FA
- Audit log of auth events (login, logout, failed attempts) per user

## 12. Open Questions
1. Does every user get exactly one auto‑created workspace at signup (like a personal Google Drive), or is workspace creation a separate explicit step?
2. Should `dashboard.example.com` be a workspace *picker* only, or does it double as the default workspace for users with a single workspace (skip the picker)?
3. What's the reserved‑slug policy — which words (e.g. `admin`, `api`, `mail`) are blocked from being claimed as workspace slugs to avoid collision with future first‑party subdomains?
4. Local dev strategy: `*.localhost` subdomains work in most browsers without `/etc/hosts` edits — confirm this is acceptable for the dev workflow, or if a `lvh.me`‑style wildcard DNS service is preferred.

---
*This PRD defines architecture and contracts; implementation should proceed in the phase order above, with Phase 1 fully test‑covered (unit tests on middleware subdomain extraction, integration tests on the auth flow, and a tenant‑isolation test verifying cross‑workspace data cannot leak) before Phase 2 begins.*