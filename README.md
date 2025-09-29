# Visman Immigration Website

A rebranded, production-ready visa & immigration website for Visman with actionable contact info, structured data, and a minimal backend for lead capture.

## Features
- Visman branding, logo, and favicon
- Actionable contact links: `mailto:` and `tel:`
- JSON-LD Organization schema in `index.html`
- Responsive Bootstrap front-end with custom theme overrides
- Functional contact form wired to an Express backend
- Leads persisted to JSON (`server/data/leads.json`)
- Optional email notifications via SMTP (Nodemailer)
- Basic security: Helmet, rate limiting, honeypot field

## Project Structure
```
visa-immigration-website/
├─ index.html, about.html, service.html, countries.html, contact.html, ...
├─ css/, js/, img/, lib/, scss/
└─ server/
   ├─ server.js
   ├─ package.json
   ├─ data/
   │  └─ leads.json (auto-created)
   ├─ .env.example
   └─ .gitignore (ignores node_modules, .env, data/leads.json)
```

## Prerequisites
- Node.js 18+ for the backend
- A local browser for static pages (open the HTML files directly)

## Quick Start (Local)
1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Start the backend:
   ```bash
   npm start
   ```
   The API runs at `http://localhost:3001`.
3. Open `contact.html` in your browser. Submit a test message.
4. Confirm lead saved in `server/data/leads.json`.

## API
- Health check: `GET /api/health`
- Create lead: `POST /api/contact`
  - Body JSON: `{ name, email, phone?, project?, subject?, message, company_website? }`
  - Returns: `{ ok: true, leadId }` on success

## Email Notifications (Optional)
1. Copy `.env.example` to `.env` in `server/` and set your SMTP values:
   ```env
   SMTP_HOST=...
   SMTP_PORT=587
   SMTP_USER=...
   SMTP_PASS=...
   NOTIFY_TO=nnamelekelechi9@gmail.com
   MAIL_FROM="Visman <no-reply@visman.local>"
   ```
2. Restart the server. New submissions will also send an email.

## Security
- Helmet for secure headers
- Rate limiting on `/api/*`
- Honeypot field (`company_website`) to reduce spam

## Production Deployment
- Front-end: Host static files (e.g., Netlify, GitHub Pages, Vercel static export, NGINX)
- Backend: Deploy `server/` (e.g., Render, Railway, Fly.io, Heroku)
- CORS: `server/server.js` allows `origin: '*'` by default; restrict to your domain in production.
- Update front-end API URL if hosting backend on a different domain. In `js/main.js`, change:
  ```js
  const res = await fetch('http://localhost:3001/api/contact', { ... })
  ```
  to your production endpoint, e.g. `https://api.visman.com/api/contact`.

## Customization
- Countries: Update labels and images in `about.html` and `countries.html`.
- Branding: Replace `img/visman-logo.svg` and `img/favicon.svg` with final assets (same filenames).
- Content: Edit About/Services copy in `about.html`, `service.html`, and `index.html`.

## License / Credits
- Front-end template portions adapted from HTML Codex (credit retained in footer).

---
If you need help deploying or switching the API URL for production, open an issue or contact the maintainer.
