# CampusSwap — Production Deployment Guide

This guide outlines the production deployment process for CampusSwap on modern static hosting platforms (Vercel, Netlify, Cloudflare Pages) connected to a managed Supabase backend.

---

## 1. Prerequisites & Architecture

- **Frontend**: React 18 + Vite SPA + TailwindCSS
- **Backend & Database**: Supabase (PostgreSQL 15+, Auth, Row-Level Security, Storage)
- **Node Version**: Node.js 18.x or 20.x

---

## 2. Environment Variables

Create the following environment variables in your hosting provider's dashboard (e.g. Vercel Project Settings -> Environment Variables):

| Variable Name | Description | Example / Note |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project API URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anonymous API Key | `eyJhbGciOiJIUzI1...` |
| `VITE_APP_NAME` | Application Name | `CampusSwap` |
| `VITE_APP_ENV` | Target Deployment Environment | `production` |

> [!CAUTION]
> **Never** expose the Supabase `service_role` key or database master passwords in the frontend build or environment variables. The application uses Row Level Security (RLS) with the public anonymous key (`VITE_SUPABASE_ANON_KEY`).

---

## 3. Supabase Database & Storage Setup

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open [`supabase/schema.sql`](supabase/schema.sql) (or run the ordered migrations from `supabase/migrations/00001` through `00009`).
4. Click **Run** to execute the master schema. This provisions all 25+ tables, foreign keys, unique constraints, indexes, and Row Level Security policies.
5. In **Storage**, verify that the following 6 buckets were created:
   - `avatars` (Public)
   - `listing-images` (Public)
   - `resource-images` (Public)
   - `knowledge-files` (Public)
   - `donation-images` (Public)
   - `project-files` (Private / Authenticated)

---

## 4. Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 5. Deployment Options

### Option A: Vercel (Recommended)
1. Push your code to GitHub / GitLab / Bitbucket.
2. In Vercel, click **Add New Project** and import the repository.
3. Framework Preset will automatically detect **Vite**.
4. Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
5. Click **Deploy**.
6. SPA routing is pre-configured via [`vercel.json`](vercel.json).

### Option B: Netlify
1. Connect your repository in the Netlify Dashboard.
2. Set Build Command to `npm run build` and Publish Directory to `dist`.
3. Under **Site Configuration** > **Environment variables**, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy Site**.
5. SPA routing fallback is pre-configured via [`public/_redirects`](public/_redirects).

### Option C: Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages**.
2. Connect Git repository.
3. Select **Vite** preset, Build Command: `npm run build`, Build output directory: `dist`.
4. Add Environment Variables and deploy.

---

## 6. Post-Deployment Verification Checklist

- [ ] **Auth Flow**: Register a new student account, verify email/session, login, and logout.
- [ ] **Marketplace**: Create a listing with custom image upload, search, and view listing details.
- [ ] **Lab Inventory**: Filter campus resources and verify live stock statuses.
- [ ] **Escrow / Rentals**: Request hardware borrow/rental and inspect transaction timeline.
- [ ] **AI Assistant**: Run project decomposition, check BOM generation, and save project.
- [ ] **SOS Emergency**: Broadcast an SOS request and inspect match suggestions.
- [ ] **Community & Donations**: Bookmark technical pinouts in Knowledge Hub and claim donated hardware.
- [ ] **SPA Direct Deep-Links**: Direct reload on deep routes (e.g. `/profile`, `/explore`, `/item/:id`) serves `index.html` without 404s.
