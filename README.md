# TATAmart B2B Enterprise Marketplace

A production-grade B2B marketplace platform inspired by **Tata Motors / Tata.ev** corporate-tech aesthetics — an enterprise IndiaMART-style platform for Electronics, IT Hardware, and Mechanical Parts.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma 7 (ORM) |
| Search | Elasticsearch 8.x (fuzzy, boosted, filtered) |
| Auth | JWT (role-based: BUYER / SELLER / ADMIN) |
| Infra | Docker Compose |

---

## Features

### 🛒 Buyer Portal
- Browse industrial B2B product catalog
- Advanced Elasticsearch-powered search with filters
- Add to Cart & Corporate Checkout
- Send RFQs (Request For Quotation) to sellers
- Track inquiry history

### 📦 Seller Command Center
- Add, Edit, Delete product listings
- View and respond to incoming RFQs
- Lead analytics & inquiry velocity tracking

### 🏛️ Admin Control Center
- User verification & moderation
- Platform-wide product oversight
- Real-time KPI stats (users, products, orders, inquiries)

### 🔍 Search System
- Elasticsearch fuzzy search
- Title-boosted relevance ranking
- Filter by category, price range

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### 1. Start Infrastructure
```bash
docker-compose up -d
```
This starts PostgreSQL, Elasticsearch, and Redis.

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your DATABASE_URL and other secrets
npm install
npx prisma db push
npx prisma generate
npx ts-node prisma/seed.ts    # Seeds demo data
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the App
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Prisma Studio | `npx prisma studio` → http://localhost:5555 |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Seller | seller@tatamart.com | password123 |
| Buyer | buyer@tatamart.com | password123 |

---

## Project Structure

```
TATAmart/
├── backend/                 # Node.js + Express API
│   ├── prisma/              # Prisma schema + migrations + seed
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # Express routers
│   │   ├── middlewares/     # Auth + role guards
│   │   └── server.ts        # App entrypoint
├── frontend/                # Next.js App Router
│   └── src/
│       ├── app/             # Pages (home, products, cart, dashboards)
│       ├── components/      # Reusable UI components
│       ├── store/           # Zustand auth state
│       └── utils/           # Axios API client
├── docker-compose.yml       # Full infrastructure definition
└── php-services/            # PHP auxiliary modules
```
