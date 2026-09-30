# SignalDesk Deployment Guide

This guide covers deploying **SignalDesk** to production with a decoupled architecture:
- **Frontend**: Hosted on **Vercel** (Global Edge CDN, automatic SSL, preview environments).
- **Backend & Worker**: Hosted on a continuous process platform (**Render**, **Railway**, or **Fly.io**).
- **Database & Queue**: Managed **PostgreSQL** (**Neon** or **Supabase**) and **Redis** (**Upstash**).

---

## 1. Deploying Frontend to Vercel

### Option A: Via Vercel Web Dashboard (Recommended with GitHub)
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `alokagarwal565/signal-desk`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default, our root `vercel.json` handles monorepo build) or set to `frontend`.
   - **Build Command**: `npm run build -w frontend`
   - **Output Directory**: `frontend/dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://api.yourdomain.com` or `https://signaldesk-api.onrender.com`).
6. Click **Deploy**. Vercel will build and deploy the application with a production URL (e.g., `https://signal-desk.vercel.app`).

### Option B: Via Vercel CLI
From your local terminal:
```bash
# Link project and deploy to preview
vercel

# Deploy directly to production
vercel --prod
```

When prompted:
- Set up and deploy: **Yes**
- Scope: **alokagarwal565**
- Link to existing project: **No** (creates new project `signal-desk`)
- Project name: `signal-desk`
- Located in `./`: **Yes**
- Override settings: **No** (settings in `vercel.json` are automatically used)

To set the production API URL via CLI:
```bash
vercel env add VITE_API_URL production
```

---

## 2. Deploying Backend & Workers

SignalDesk's backend uses **Fastify** for HTTP API endpoints and **BullMQ** for background website scraping, intelligence extraction, and opportunity scoring. Because background queues require long-lived worker loops, deploy the backend to a continuous host:

### Recommended Services:
- **Render**: Web Service (Node.js runtime)
  - Build command: `npm install && npm run build -w backend`
  - Start command: `npm run start -w backend`
- **Railway**: GitHub Repo deployment (automatic Node.js service detection)

### Backend Environment Variables:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/signaldesk?sslmode=require
REDIS_URL=rediss://default:password@host:6379
JWT_SECRET=your-random-32-char-secret
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Managed Database & Redis (Free/Low-Cost Cloud Tiers):
- **PostgreSQL**: [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) (Serverless Postgres with pooled connection strings).
- **Redis**: [Upstash](https://upstash.com) or [Railway Redis](https://railway.com) (Serverless / cloud Redis for BullMQ).

---

## 3. Database Migration on Production
Run database migrations against your remote PostgreSQL instance:
```bash
DATABASE_URL="your-production-db-url" npm run db:migrate -w backend
```

---

## 4. Client-Side Routing & SPA Fallback
The included `vercel.json` contains:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures direct URLs (such as `/companies/95d960a5-110c-43d7-b2b7-ac3f7b3013a1` or `/add`) route correctly to the single-page application without 404 errors.
