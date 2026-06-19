# Nexus Analytics — User Behavior Tracking & Analytics Platform

Created by [Shivam Tiwari](https://shivamtiwari.me)

### 🚀 Deployed Links
* 🛒 **Tracker Web Page**: [https://ecom-analytics-wvzq.vercel.app/](https://ecom-analytics-wvzq.vercel.app/)
* 📊 **Analytics Dashboard**: [https://ecom-analytics-three.vercel.app/](https://ecom-analytics-three.vercel.app/)

---

A production-grade, full-stack user behavior analytics platform featuring a vanilla tracking script, a high-performance Node.js/TypeScript backend, and a beautiful Vite + React analytics dashboard. 

The demonstration ecosystem is powered by a premium e-commerce storefront (**NexusStore**) that naturally triggers standard (page view, click) and semantic (cart addition, checkout, purchase, newsletter subscription) tracking events.

---

## Setup & Installation Instructions

To run the project locally, follow these sequential steps to ensure ports are bound correctly.

### Clone the Repo
   ```bash
     git clone https://github.com/progressmantraclasses/ecom-analytics.git
   ```

### Go inside the cloned repository
   ```bash
     cd ecom-analytics
   ```
   

### 1. Backend Server Setup
The backend requires MongoDB and optionally Redis.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Verify your `.env` matches the following configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/analytics
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   LOG_LEVEL=info
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up on **port 5000**.*

---

### 2. Analytics Dashboard Setup (Vite + React)
Start the dashboard first to claim port `5173`.

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the dashboard dev server:
   ```bash
   npm run dev
   ```
   *Vite will boot the dashboard on **http://localhost:5173**.*

---

### 3. Storefront Setup (Tracker Demo)
Start the storefront next; it will automatically bind to port `5174`.

1. Navigate to the tracker directory:
   ```bash
   cd ../tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the storefront dev server:
   ```bash
   npm run dev
   ```
   *Vite will boot the storefront on **http://localhost:5174**.*

---

## System Architecture

The platform is organized into three major components:

1. **Tracker Script & Storefront** (`tracker/`) — Vanilla JS UMD tracking script embedded on a high-fidelity, dark-themed e-commerce storefront showing tech products. Includes an overlay event log console for real-time tracking visualization.
2. **Backend API** (`backend/`) — High-performance Express + TypeScript API utilizing MongoDB for persistence, Redis/Upstash for caching, and Zod for schema validation. **Runs on port `5000`**.
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
└── tracker/                  # NexusStore Storefront & Tracking Script (Port 5174)
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

## Alternative Setup: Docker Compose
This runs the entire stack (MongoDB, Redis, Backend, Frontend) concurrently.

1. Ensure Docker is running.
2. In the root directory, start all services:
   ```bash
   docker-compose up -d
   ```
3. Services access:
   - **Backend API**: `http://localhost:5000`
   - **Analytics Dashboard**: `http://localhost:3000`
   - **NexusStore Storefront**: `http://localhost:5174` (Runs locally)

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

## Architecture Decisions & Trade-offs

### 1. Pre-aggregated Sessions Collection
Instead of running MongoDB aggregation pipelines on the `events` collection on every dashboard request (which would be $O(n)$ over all events), we maintain a `sessions` collection that is updated via `bulkWrite` upserts on every ingest. This gives $O(1)$ reads for the sessions list and dashboard stats.

*Trade-off:* Slight write amplification on ingest; acceptable because reads are far more frequent.

### 2. Redis Cache Strategy
- **Stats**: 10s TTL (acceptable staleness for a dashboard)
- **Sessions list**: 30s TTL per page/sort key
- **Session events**: 60s TTL (individual sessions don't change often)
- **Heatmap**: 30s TTL
- **Cache invalidation**: On each batch ingest, we pattern-delete all `analytics:sessions:*` and `analytics:stats` keys to prevent stale data.

*Graceful fallback:* If Redis is unavailable, the backend silently falls back to direct MongoDB queries — no downtime.

### 3. Batch Event Ingestion
Events are queued client-side and flushed every 2 seconds or when the queue hits 10. Server-side `insertMany({ ordered: false })` allows partial success — malformed documents don't block valid ones.

*Why not single events?* Reduces HTTP overhead by 10–50x for high-traffic pages. p99 < 50ms even with 500 events per batch.

### 4. Heatmap Coordinate Normalization
Raw click coordinates (x, y) are stored alongside `viewport_width` and `viewport_height`. When rendering, we normalize:
```
canvas_x = (click.x / click.viewport_width) * canvas.width
canvas_y = (click.y / click.viewport_height) * canvas.height
```
This ensures clicks recorded on mobile (375px wide) and desktop (1440px wide) are correctly overlaid on a single canvas.

### 5. Session Expiry Logic (Client-Side)
Sessions expire after 30 minutes of inactivity. The last-activity timestamp is stored in `localStorage` alongside the session UUID. On each event, the timer is reset. After 30 minutes of no events, the next event creates a new session UUID.

This mirrors industry-standard analytics (e.g., Google Analytics 30-minute session window).

### 6. MongoDB Indexes
Compound indexes `[session_id, timestamp]` and `[page_url, event_type, timestamp]` cover the most frequent query patterns:
- Fetching all events for a session (ordered by time)
- Heatmap queries filtered by URL, type, and time range

*An optional TTL index on `created_at` (commented out in code) can enforce 90-day data retention at the database level.*

---

## Scalability: What Changes at 1M Events/Day?

| Component | Current | At 1M/day |
|-----------|---------|------------|
| **Event ingestion** | Direct MongoDB insert | Kafka/BullMQ message queue → consumer |
| **Analytics storage** | MongoDB | ClickHouse (columnar, analytics-optimized) |
| **Cache** | Single Redis | Redis Cluster |
| **Backend** | Single process | PM2 cluster or Kubernetes HPA |
| **Tracker delivery** | Served from app | CDN (CloudFront/Fastly) |
| **MongoDB** | Single node | Atlas with replica set + read preferences |
| **Session aggregation** | In-memory during request | Flink/Spark streaming aggregate |

---

## Assumptions

- **Authentication is out of scope** — The dashboard is a single-user admin panel. In production, you'd add JWT auth or SSO.
- **Tracker events are trusted** — No bot detection or IP-based filtering is implemented. At scale, you'd add fingerprinting and rate limiting per session ID.
- **Data retention** — Events are stored indefinitely in development. The TTL index (90 days) is commented out but ready to enable.
- **Viewport normalization** — Assumed all page renders are full-page (no iframes). Click coordinates may be slightly off for pages with sticky headers in certain browsers.
- **UTC timestamps** — All timestamps are stored and displayed in UTC. Timezone conversion is the responsibility of the consuming application.
- **Redis as optional** — Redis is a performance optimization, not a hard dependency. The system degrades gracefully without it.
- **Single-origin tracker** — The demo page uses `localhost:5000` as the endpoint. In production, the endpoint would be configured via the `data-endpoint` attribute and served from a CDN.
