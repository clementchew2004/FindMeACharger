# FindMeACharger

A full-stack web app that helps people find nearby public charging ports (USB-C and Lightning) for their phones and other devices. Users can plan a route to a charging point and report faulty ports, and operators and moderators can manage the charging points.

Built by the **ObjectOrientedOracles** team as a university Software Engineering group project (2025–26).

---

## Features

**For users (customers)**
- **Interactive map** of charging points, built with Leaflet and OpenStreetMap
- **Nearby search and filters**: find charging points within a distance and filter by port type (USB-C, Lightning), status and accessibility
- **Route planning** to a charging point by walking, cycling, driving or wheelchair, using OpenRouteService
- **Emergency mode**: one tap routes you to the nearest available charging point when your battery is running low
- **Bookings** for charging bays
- **Fault reporting** for broken or blocked charging ports
- **Profile management**
- **Multi-language UI** (English and French) with i18next

**For operators and moderators**
- **Charging point management**: create, update and delete charging points and their bays
- **Stats and reports** across all charging points
- **Role-based access control**: management endpoints are limited to operators and moderators

---

## Tech Stack

| Layer | Technologies |
| ----- | ------------ |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui (Radix), React Router, React Leaflet, i18next |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Auth | Better Auth (session based) |
| Database | PostgreSQL (`pg`) |
| Routing API | [OpenRouteService](https://openrouteservice.org/) (HeiGIT) |
| Testing | node-tap (backend), Vitest + Testing Library (frontend) |

---

## Project Structure

```
.
├── src/                  # Express backend
│   ├── controller/       # Request handlers (charging points, bookings, map, reports, users)
│   ├── routes/           # API route definitions (mounted under /api)
│   ├── middleware/       # Auth and role-based access control
│   ├── lib/              # DB pool and Better Auth config
│   └── server.ts         # App entry point (port 8000)
├── client/               # React + Vite frontend
│   └── src/
│       ├── pages/        # Login, Signup, Map/Routing, Report, Profile, Management
│       ├── components/   # UI components (shadcn/ui, emergency mode, forms…)
│       ├── tests/        # Vitest integration tests
│       └── i18n.ts       # Translations
├── database/
│   ├── schema/           # Table definitions and incremental modifications
│   └── sample_data/      # Seed data
├── scripts/db/db.js      # Cross-platform DB setup script
└── tests/                # node-tap backend tests
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended) and npm
- [PostgreSQL](https://www.postgresql.org/)
- A free [OpenRouteService API key](https://account.heigit.org/manage/key)

### 1. Backend setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
| -------- | ----------- |
| `DB_PASSWORD`, `DB_USER`, `DB_NAME`, `DB_HOST`, `DB_PORT` | Your PostgreSQL connection details |
| `BETTER_AUTH_SECRET` | A random string of 32+ characters. Generate one with `openssl rand -base64 32` or [Better Auth's generator](https://better-auth.com/docs/installation#set-environment-variables) |
| `ORS_API_KEY` | Your OpenRouteService API key |
| `AUTH_API_ORIGIN` / `CLIENT_ORIGIN` | Defaults: `http://localhost:8000` / `http://localhost:5173` |

### 2. Database setup

```bash
npm run db:init       # create the database, tables and constraints
npm run db:modify     # apply schema modifications
npm run db:populate   # load sample data
```

After you change the DB structure, re-run `npm run db:modify`.

### 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env  # sets VITE_API_BASE_URL=http://localhost:8000
```

---

## Running the App

Run each in its own terminal:

```bash
# Backend: http://localhost:8000
npm run dev
```

```bash
# Frontend: http://localhost:5173
cd client
npm run dev
```

### Demo accounts (from the sample data)

| Role | Email | Password |
| ---- | ----- | -------- |
| Operator | `operator@test.com` | `password1234` |
| Customer | `customer@test.com` | `password1234` |

---

## API Overview

All endpoints are under `/api`. Auth is handled by Better Auth at `/api/auth/*`.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/charging-points` | List all charging points |
| GET | `/charging-points/nearby` | Charging points within a distance |
| GET | `/charging-points/filter` | Filter charging points |
| GET | `/charging-points/stats` | Network statistics |
| GET | `/charging-points/:id/status` | Live status of a charging point |
| GET | `/charging-points/:id/accessibility` | Accessibility info |
| GET | `/charging-points/:id/bays` | Charging ports (bays) at a charging point |
| POST / PATCH / DELETE | `/charging-points[/:id]` | Manage charging points *(operator/moderator)* |
| POST / PATCH | `/charging-points/:id/bays`, `/charging-bays/:id` | Manage bays *(operator/moderator)* |
| GET | `/bay-types` | Available port types (USB-C, Lightning) |
| GET | `/get-route` | Route between two points (`start`, `end`, `mode`) |
| POST | `/booking` | Book a charging port |
| GET | `/report-types` | Report categories |
| POST | `/create-reports` | Submit a fault report |
| GET | `/reports` | List reports |
| GET / PUT | `/user/profile` | View or update the user profile |
| GET | `/me` | Current signed-in user |

---

## Testing

### Backend (node-tap)
Set up and populate the database, start the backend, then run:

```bash
npm test
```

### Frontend (Vitest)

```bash
cd client
npm test
```

| Type | Framework | Target | Pass rate |
| ---- | --------- | ------ | --------- |
| Unit (integrated) | node-tap | Controllers and DB | 100% |
| Unit (isolated) | node-tap | Middleware, routing endpoint | 100% |
| Integration | Vitest | Frontend UI | ~65% |

The backend tests reach about 93% branch coverage. See [TESTPLAN.MD](TESTPLAN.MD) for the full testing approach.

---

## Team

Developed by **ObjectOrientedOracles** for the Software Engineering module, 2025–26.
