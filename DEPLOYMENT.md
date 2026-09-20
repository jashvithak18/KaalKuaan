# Kaal Kuaan — Deployment Guide

This guide outlines deployment options for the **Kaal Kuaan Public Borewell Safety Network**.

---

## 1. Environment Variables Overview

### Backend (`server/.env`)
| Variable | Value / Description | Required |
|---|---|---|
| `PORT` | `5000` (or host assigned e.g. `$PORT` on Render/Railway) | Yes |
| `NODE_ENV` | `production` | Yes |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.xlfiowc.mongodb.net/kaalkuandb?appName=Cluster0` | Yes |
| `JWT_SECRET` | `kaal_kuaan_operational_secret_key_2026` | Yes |
| `GROQ_API_KEY` | `gsk_your_groq_api_key_here` | Yes |
| `AI_API_KEY` | `gsk_your_groq_api_key_here` | Yes |

### Frontend (`client/.env`)
| Variable | Value / Description | Required |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend (`https://kaalkuaan.onrender.com`). Leave empty if serving client from the same Node server. | Optional (for split deploys) |

---

## 2. Deployment Option A: Vercel (Frontend) + Render (Backend) [Recommended]

### Backend on Render:
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a **New Web Service**:
   - **Service Name**: `kaalkuaan` (gives `https://kaalkuaan.onrender.com`)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add the variables from table above (`MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `NODE_ENV=production`).
3. Your live API endpoint will be: `https://kaalkuaan.onrender.com`.

### Frontend on Vercel:
1. Connect your repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://kaalkuaan.onrender.com`
5. Click **Deploy**.
   - Note: The `client/vercel.json` SPA rewrite is already pre-configured so deep routes will not 404.

---

## 3. Deployment Option B: Single Fullstack Service (Render / Railway)

The backend server is already pre-configured to automatically serve `client/dist` statically if built.

1. Create a Web Service with root directory as repo root or use the provided `render.yaml` blueprint.
2. Build command:
   ```bash
   cd client && npm install && npm run build && cd ../server && npm install
   ```
3. Start command:
   ```bash
   cd server && npm start
   ```

---

## 4. Verification & Health Check

After deployment, verify the endpoints:
- **API Health**: `GET https://kaalkuaan.onrender.com/api/health`
- **Wells API**: `GET https://kaalkuaan.onrender.com/api/wells`
- **AI Safety Assistant**: `POST https://kaalkuaan.onrender.com/api/ai/assistant`
