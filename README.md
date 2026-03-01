# FireGuard AI

FireGuard AI is a full-stack wildfire monitoring and prediction platform.

It combines:
- Real-time environmental ingestion (weather + geolocation/forest zones)
- Explainable risk intelligence scoring
- Satellite and drone operations workflows
- Admin-only authenticated operations console

## Tech Stack

- Frontend: React + Vite + Tailwind + Recharts + React-Leaflet
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT (HTTP-only cookies)

## Core Capabilities

- Admin login and protected session flow
- Forest monitoring mode (DB-driven forest zones)
- Community monitoring mode (browser geolocation + city search fallback)
- Real-time environmental ingestion with 60s refresh
- Explainable fire risk scoring and analytics
- Drone fleet activation/standby workflow
- Satellite capture storage and gallery
- Risk/alert/report dashboards driven by live state

## Page Map

- `Live Feed` (`dashboard`): Live environmental metrics + historical trend
- `Satellite Monitoring`: Map-centric zone/community visualization
- `Risk Analysis`: Risk KPIs, factor charts, active drone overlay
- `Drone Monitoring`: Satellite map + active/available drones + captures
- `Fire Prediction`: AI forecast, spread simulation, confidence, recommendations
- `Alerts`: AI-driven alert feed with filtering/actions
- `Reports`: Derived analytics + model summary + export actions
- `Settings`: Runtime preferences

## Architecture (High Level)

### Backend

- `server.js`: app setup, CORS, JSON limits, route registration, DB startup
- `config/db.js`: Mongo connection
- `middleware/protectRoute.js`: cookie JWT verification
- `controllers/*`: request orchestration + validation
- `services/*`: weather fetch, data processing, risk logic persistence helpers
- `models/*`: Admin, LoginLog, ForestZone, EnvironmentalLog, RiskLog, Drone, DroneCapture
- `routes/*`: auth, zones, environment, risk, drones

### Frontend

- `src/app/App.tsx`: app shell, auth gate, routing by sidebar state
- `src/app/context/MonitoringContext.tsx`: shared global monitoring state
- `src/layer1/*`: environmental ingestion hooks/context/panel
- `src/utils/firePredictionEngine.ts`: centralized AI risk/forecast engine
- `src/app/components/*`: page components and UI sections

## Environment Variables

Use `.env` (backend) and Vite variables for frontend API base URL.

Reference template: `.env.example`.

Required keys:

- `PORT=5000`
- `MONGO_URI=...`
- `WEATHER_API_KEY=...`
- `JWT_SECRET=...`
- `FRONTEND_URL=http://localhost:5173`
- `VITE_API_BASE_URL=http://localhost:5000`

## Install & Run

```bash
npm install
```

Run backend:

```bash
npm run server
```

Run frontend:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

## Bootstrap Commands

Create admin:

```bash
npm run create-admin
```

Seed forest zones:

```bash
npm run seed-zones
```

## Default Admin (seed script)

- Username: `superadmin`
- Password: `StrongPassword@123`

(Defined in `scripts/createAdmin.js`.)

## API Summary

All protected routes require valid login cookie.

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Forest Zones

- `GET /api/zones`
- `GET /api/zones/:id`
- Alias: `GET /api/forest-zones`

### Environment

- `GET /api/environment?mode=forest&zoneId=<mongoId>`
- `GET /api/environment?mode=live&lat=<num>&lon=<num>`
- `GET /api/environment/history?...`

### Risk

- `POST /api/risk`
- `GET /api/risk/history?lat=<num>&lon=<num>`
- `GET /api/risk/analytics?lat=<num>&lon=<num>`

### Drones

- `GET /api/drones/available?location=<name>`
- `GET /api/drones/active?location=<name>`
- `POST /api/drones/activate`
- `POST /api/drones/stop`
- `POST /api/drones/capture`
- `GET /api/drones/captures?location=<name>`

## Data Flow Notes

### Forest Mode

1. Frontend loads zones from backend (`/api/forest-zones`, fallback `/api/zones`)
2. Selected zone uses Mongo `_id` as `zoneId`
3. Backend resolves zone coords from DB and fetches weather
4. Processed environmental log + risk log returned
5. Frontend updates all monitoring views from shared context

### Community Mode

1. Browser geolocation requested with high accuracy (`maximumAge: 0`)
2. Reverse geocode resolves human-readable location
3. Backend called with fresh `lat/lon`
4. If permission denied/fails, user can search city manually

## Operational Behavior

- Environmental refresh interval: 60 seconds
- Environment cache window on backend: 5 minutes
- Drone telemetry simulation updates: every 10 seconds (frontend state)
- Capture payload support: up to 50MB JSON body

## Troubleshooting

### `POPULAR FOREST ZONES (0)`

- Ensure backend is running and authenticated
- Run zone seed: `npm run seed-zones`
- Verify backend log: `Forest zones fetched: <count>`
- Confirm `MONGO_URI` points to expected DB

### `Invalid forest zone id`

- Ensure frontend sends Mongo `_id` as `zoneId`
- Confirm selected zone comes from backend list (not static ids like `western-ghats`)
- Check backend warning log for received invalid value

### Wrong live location shown

- Re-allow browser location permission
- Hard refresh browser
- Confirm logs show fresh latitude/longitude and reverse-geocoded address
- Verify no VPN/mock location overrides

### Capture returns 500

- Verify backend running with `express.json({ limit: '50mb' })`
- Ensure `imageBase64` format is `data:image/<type>;base64,...`
- Check backend logs for `CAPTURE ERROR`

## Security Notes

- JWT is cookie-based (`httpOnly`, `sameSite: strict`)
- Use strong `JWT_SECRET`
- Set `NODE_ENV=production` to enforce secure cookies
- Never commit real credentials or production secrets

## Current Repo Notes

- Dist files may exist locally from prior builds
- No formal test suite is configured yet

## Recommended Next Steps

1. Add automated tests for controllers/services (risk + environment + drones)
2. Add API docs (OpenAPI/Swagger)
3. Add deployment profiles (dev/staging/prod)
4. Add role/audit expansion beyond single-admin pattern
