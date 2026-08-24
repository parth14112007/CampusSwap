# CampusSwap — Engineering Campus Marketplace & Lab Network

![CampusSwap Banner](https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80)

**CampusSwap** is a student-to-student engineering marketplace and academic resource network built with **React 18 + Vite + Tailwind CSS** and powered by **Supabase**. It empowers university students to buy, sell, borrow, and rent microcontrollers, sensors, development boards, and specialized laboratory equipment with built-in escrow protection, multi-factor smart matching, and physical QR handover verification.

---

## 🌟 Major Feature Modules

### 1. 🛒 Marketplace & Rentals
- **Hardware Catalog (`/explore`)**: Browse components across Arduino, ESP32, Raspberry Pi, Sensors, Motor Drivers, Robotics Kits, and Prototyping Tools.
- **Transaction Types**: Support for Daily/Weekly Rentals, Direct Sale, and Free Peer Borrowing with refundable escrow deposits.
- **Hardware Specifications (`/item/:id`)**: Technical specs tables, lender credibility scores, and instant checkout requests.
- **Listing Publisher (`/list-item`)**: Device camera/photo uploads via Supabase Storage, hardware presets, and live card preview.
- **Rentals Tracker (`/active-rental`, `/my-rentals`)**: Return countdown timer, step-by-step transaction timeline, and active rental extensions.

### 2. 🔬 Campus Resource Network (`/inventory`)
- **Live Lab Inventory**: Real-time component availability across academic buildings, FabLabs, and mechatronics bays.
- **Stock Reconciliation**: Live unit counts (`total_units`, `available_units`) with automatic low-stock alerts.
- **Cross-Inventory Matching**: Transparent cross-referencing between university labs and peer listings.

### 3. 🤖 AI Intelligence Experience
- **AI Smart Match (`/ai-match`)**: Multi-factor weighted compatibility engine ranking items by keyword relevance (35%), live availability (25%), campus proximity (15%), budget fit (15%), and trust score (10%).
- **AI Project Assistant (`/ai-assistant`)**: Decomposes hardware ideas into complete Bill of Materials (BOM) with instant campus lab readiness percentages.
- **Project Kits (`/project-kits`)**: Pre-curated engineering starter bundles with 1-click conversion to active student projects.

### 4. 🚨 SOS Emergency Hardware Network (`/sos`)
- **Broadcast Board**: Urgent component requests for lab viva demos, hackathons, and capstone deadlines.
- **Peer Resource Offers**: Instant responses from classmates with automated Handover QR generation upon acceptance.
- **Dynamic Expiration**: Time-sensitive expiration tracking without ghost listings.

### 5. 🛡️ Trust, QR Handover & Reputation (`/handover`, `/profile`)
- **QR Handover Verification**: Physical exchange verification using unique, time-limited cryptographic handover tokens.
- **Multi-Category Reviews**: Rating dimensions for Communication, Item Condition, Punctuality, and Reliability.
- **Deterministic Trust Badges**: Automated awards for *Verified Student*, *Reliable Lender*, *On-Time Returner*, and *Active Campus Member*.

### 6. 🤝 Community Ecosystem
- **Engineering Knowledge Hub (`/knowledge-hub`)**: Pinout diagrams, wiring schematics, and tutorials across 11 technical categories with persistent bookmarks.
- **Project Partner Finder (`/partner-finder`)**: Teammate discovery based on engineering skills, domain overlap, and project invites.
- **Donate & Circular Reuse (`/donate`)**: Zero-waste hardware donations and real-time environmental metrics (CO₂ saved & e-waste prevented).
- **In-App Notification Center (`/notifications`)**: Alert dispatching for rental updates, requests, and SOS offers.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS
- **Design System**: Material Design 3 / Stitch Design System Tokens
- **Icons & Typography**: Google Material Symbols Outlined, Inter
- **Backend & Database**: Supabase (PostgreSQL 15+, Row Level Security, Auth)
- **Object Storage**: Supabase Storage (`avatars`, `listing-images`, `resource-images`, `knowledge-files`, `project-files`, `donation-images`)
- **Tooling & Bundler**: Vite 6, PostCSS, Autoprefixer

---

## 📁 Project Architecture

```
CampusSwap/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ai/           # AI matching cards, processing states, readiness bars
│   │   ├── auth/         # ProtectedRoute, campus authorization gate
│   │   ├── common/       # TopAppBar, BottomNav, Button, Modal, Toast
│   │   ├── community/    # PartnerCard, DonationCard, ImpactMetricsGrid
│   │   ├── knowledge/    # KnowledgeCard, PinoutDetailsModal
│   │   ├── marketplace/  # ListingCard, FilterBar, RequestModal
│   │   ├── sos/          # SosCard, OfferResourceModal
│   │   └── trust/        # ReputationCard, TransactionCard, RatingDialog
│   ├── context/          # React Context providers (AuthContext, MarketplaceContext)
│   ├── data/             # Mock datasets & default demonstration state
│   ├── lib/              # Supabase Client initialization & environment configuration
│   ├── pages/            # Application routes & views
│   └── services/         # Centralized API & Supabase data services
├── supabase/
│   ├── migrations/       # Ordered PostgreSQL DDL migrations (00001 - 00009)
│   └── schema.sql        # Master 1-click consolidated database schema
├── public/               # Static assets & _redirects for SPA routing
├── .env.example          # Environment variable template
├── DEPLOYMENT.md         # Production deployment guide
├── vercel.json           # Vercel SPA routing rewrite rules
└── package.json          # Project dependencies & build scripts
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/CampusSwap.git
cd CampusSwap
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase project credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Initialize Supabase Database
In your [Supabase SQL Editor](https://supabase.com/dashboard), execute the contents of [`supabase/schema.sql`](supabase/schema.sql).

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```
Production output will be generated in `dist/`.

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Enforced on all tables. Students can only update/delete their own listings, requests, ratings, and projects.
- **Storage Isolation**: User file uploads are isolated by folder prefixes matching the authenticated student ID (`(storage.foldername(name))[1] = auth.uid()::text`).
- **No Exposed Secrets**: All frontend transactions operate with the public anonymous key (`VITE_SUPABASE_ANON_KEY`). Never expose service-role credentials.

---

## 📄 License
This project is developed for engineering campus communities and academic hardware sharing.
