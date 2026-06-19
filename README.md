# Nexus Analytics — User Behavior Tracking & Analytics Platform

A production-grade, full-stack user behavior analytics platform featuring a vanilla tracking script, a high-performance Node.js/TypeScript backend, and a beautiful Vite + React analytics dashboard. 

The demonstration ecosystem is powered by a premium e-commerce storefront (**NexusStore**) that naturally triggers standard (page view, click) and semantic (cart addition, checkout, purchase, newsletter subscription) tracking events.

---

## System Architecture

The platform is organized into three major components:

1. **Tracker Script & Storefront** (`tracker/`) — Vanilla JS UMD tracking script embedded on a high-fidelity, dark-themed e-commerce storefront showing tech products. Includes an overlay event log console for real-time tracking visualization.
2. **Backend API** (`backend/`) — High-performance Express + TypeScript API utilizing MongoDB for persistence, Redis for caching, and Zod for schema validation. **Runs on port `5000`**.
3. **Analytics Dashboard** (`frontend/`) — Vite + React SPA designed with a dark glassmorphism system. Consumes the backend API to visualize stats, session metrics, user journeys, and heatmaps.

```
shivam-tiwari-assignment/
├── backend/                  # Node.js + TypeScript REST API (Port 5000)
│   ├── src/
│   │   ├── config/           # Database, Redis, and Port Configuration
│   │   ├── controllers/      # Route controllers (events, sessions, heatmaps, stats)
│   │   ├── middleware/       # Rate limiting, logging, error validation
│   │   ├── models/           # Mongoose schemas (Event, Session)
│   │   ├── services/         # Caching logic and DB transactions
│   │   └── server.ts         # Application entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Vite + React Analytics Dashboard (Port 5173 / Port 3000)
│   ├── public/               # Static assets & Brand Favicons
│   ├── src/
│   │   ├── components/       # UI elements (Heatmaps, Timelines, Charts, Tables)
│   │   ├── pages/            # Dashboard Overview, Sessions List, Session Detail, Heatmap
│   │   ├── hooks/            # TanStack Query custom data hooks
│   │   ├── lib/              # Axios API client and utility helpers
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
└── tracker/                  # NexusStore Storefront & Tracking Script
    ├── public/
    │   ├── tracker.js        # Compiled UMD analytics script
    │   └── favicon.png       # E-commerce brand favicon
    ├── src/                  # React storefront codebase
    ├── index.html            # Embedded script page
    └── package.json
```

---

## Detailed Feature Implementation

### 1. NexusStore E-Commerce Storefront
- **Visual Design**: Styled with a premium dark theme, neon borders, smooth scale transitions, and glassmorphism cards.
- **Hero Showcase**: Highlighting premium tech gadgets (smartwatch, microphone, curved monitor).
- **Product Grid**: Rendered with dynamic pricing, item description, and responsive grid layouts.
- **Cart & Drawer System**:
  - Live local state persistence using `localStorage`.
  - Interactive Shopping Cart side modal to modify items.
  - Interactive **Event Logs Console** that slides out as a drawer to display a live stream of JSON events captured by the tracker.
- **Checkout & Pricing Flow**: Form validations for shipping details, mock credit card details, and a dynamic receipt summary that triggers order calculations.

### 2. Event Tracking Capabilities
The embedded `tracker.js` intercepts and records user activity:
- **Standard Events**:
  - `page_view`: Triggered automatically on page load or client-side navigation.
  - `click`: Records absolute (x, y) coordinates relative to page document height along with the client's current viewport width/height.
- **Semantic / E-Commerce Events**:
  - `add_to_cart`: Triggered when clicking a product's "Add to Cart" button (includes product ID, name, price).
  - `begin_checkout`: Dispatched when navigating to the checkout and pricing form.
  - `purchase`: Triggered upon complete order submission, sending the cart total, number of items, and customer info.
  - `newsletter_signup`: Dispatched on newsletter sign-ups.

### 3. Analytics Dashboard Features
- **Overview Panel**: Live widgets displaying Total Sessions, Total Events, Page Views, Clicks, and Today's snapshot stats. Contains an **Events Over Time** line chart utilizing Recharts.
- **Recent Sessions Table**: Table listing latest active users, event counts, page views, click stats, and "Last Seen" relative timestamps.
- **Sessions & User Journey**:
  - Pagination, sorting ("Last Seen", "Event Count", etc.), and order controls (Newest first, Oldest first).
  - Interactive **User Journey Timeline** detailing every event type, the URL, absolute time, and click coordinate/viewport mappings.
- **Click Heatmap**:
  - Interactive page URL selector.
  - Filters by Date Range (From/To).
  - Normalizes coordinate ratios mapping different screens sizes onto a standard responsive HTML5 Canvas.
  - **Readability Dropdown Fix**: Solved the native dropdown options visibility bug by explicitly styling options to inherit dark surface colors.

---

## Setup & Installation

### Option A: Docker Compose (Recommended)
This runs the entire stack (MongoDB, Redis, Backend, Frontend) concurrently.

1. Ensure Docker is running.
2. In the root directory, start all services:
   ```bash
   docker-compose up -d
   ```
3. Services access:
   - **Backend API**: `http://localhost:5000`
   - **Analytics Dashboard**: `http://localhost:3000`
   - **NexusStore Storefront**: `http://localhost:5173` (Runs locally)

---

### Option B: Manual Setup

#### 1. Backend Server Setup
Ensure MongoDB and Redis are running locally.

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and REDIS_URL configuration
npm run dev
```
*Backend listens on port **5000**.*

#### 2. Analytics Dashboard Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Vite dev server starts on **http://localhost:5173**.*

#### 3. Storefront Setup (Tracker)
```bash
cd tracker
npm install
npm run dev
```
*Storefront dev server starts on **http://localhost:5174** (or default fallback).*

---

## API Documentation

### Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|-----------|
| `POST` | `/api/events` | Batch ingest events | 100/min |
| `GET` | `/api/sessions` | List sessions (paginated) | 30/min |
| `GET` | `/api/sessions/:sessionId/events` | Session event timeline | 30/min |
| `GET` | `/api/heatmap` | Click heatmap data | 30/min |
| `GET` | `/api/heatmap/urls` | Distinct tracked page URLs | 30/min |
| `GET` | `/api/stats` | Platform-wide stats | 30/min |
| `GET` | `/api/stats/chart` | Events by day (last 7 days) | 30/min |
| `GET` | `/health` | Health check | none |

---

## Architecture Decisions & Caching

### 1. Pre-aggregated Sessions Collection
Instead of running heavy MongoDB aggregations over the entire `events` collection on every dashboard refresh, we maintain a `sessions` metadata collection updated incrementally using `bulkWrite` on every event batch ingest. This delivers O(1) reads for session metadata and stats.

### 2. Redis Caching Policy
- Stats: 10s TTL
- Sessions List: 30s TTL per page/sort key
- Session events list: 60s TTL
- Heatmap data: 30s TTL

*On any new batch ingest, caching logic deletes keys matching `analytics:sessions:*` and `analytics:stats` to keep data current.*

### 3. Viewport Coordinate Normalization
Click coordinates are recorded relative to the element document size along with the client's screen width and height. When rendering the heatmap canvas, coords are projected:
```
canvas_x = (click.x / click.viewport_width) * canvas.width
canvas_y = (click.y / click.viewport_height) * canvas.height
```
This overlays mobile, tablet, and desktop clicks correctly onto a single canvas.

---

## Environment Variables Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/analytics
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
NODE_ENV=development
LOG_LEVEL=info
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```
