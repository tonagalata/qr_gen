# QR Studio

Landing page, auth (login/signup), and dashboard to create and manage QR code campaigns. Full CRUD with **Turso** (libSQL) and **Tailwind CSS** via the [Vite plugin](https://tailwindcss.com/docs/installation/using-vite) (no PostCSS).

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set your [Turso](https://turso.tech) credentials:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   - `TURSO_DATABASE_URL` – e.g. `libsql://your-db.turso.io`
   - `TURSO_AUTH_TOKEN` – from `turso db tokens create your-db`

   If you see **401** from the API, the auth token is invalid or expired; create a new one in the Turso dashboard.

3. **Run**

   ```bash
   npm run dev
   ```

   App: http://localhost:5173  
   API: http://localhost:5173/api/codes (CRUD)

## Scripts

- `npm run dev` – Vite dev server + API (Turso)
- `npm run build` – Production build
- `npm run preview` – Preview production build

## Deploy to Netlify

1. **Connect the repo** to Netlify (GitHub/GitLab) or use the Netlify CLI:

   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   ```

2. **Set environment variables** in Netlify (Site settings → Environment variables):

   - `TURSO_DATABASE_URL` – e.g. `libsql://your-db.turso.io`
   - `TURSO_AUTH_TOKEN` – from `turso db tokens create your-db`
   - `JWT_SECRET` – a long random string for auth (required in production)

3. **Build settings** (usually auto-detected from `netlify.toml`):

   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

4. **Deploy**

   - Push to your connected branch, or run `netlify deploy --prod` after `netlify init`.

The app is an SPA; `/api/*` is rewritten to a serverless function that runs the same Turso + auth + codes API.

## Stack

- **Frontend:** React, React Router, Tailwind (Vite plugin only)
- **API:** Express in dev (Vite), serverless function on Netlify
- **DB:** Turso (libSQL) via `@libsql/client`
