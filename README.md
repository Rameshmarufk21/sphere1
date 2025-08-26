# GeoTagSphere

Full-stack starter "Memory Earth" app.

## Quickstart

1. Unzip and `cd GeoTagSphere`
2. Install dependencies:
   - `npm install` (in root will install concurrently)
   - `cd server && npm install`
   - `cd ../client && npm install`
3. Create .env files:
   - `server/.env` -> `PORT=5000`
   - `client/.env` -> `VITE_MAPBOX_TOKEN=your_mapbox_token_here` (optional)
4. Run:
   - From root: `npm run dev`
   - Server runs on http://localhost:5000
   - Client runs on http://localhost:5173

Notes:
- Uploads are saved to `server/uploads/`.
- Database is SQLite at `server/database.sqlite`.
- If you don't have a Mapbox token, the app falls back to a public demo style (lower res).
