# Pocket Notes

Mobile-first notes app with tagging and search, built on Next.js for easy deployment to Vercel.

## Getting Started

### Requirements

- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to use the app in your browser or mobile simulator.

### Build & Lint

```bash
npm run build
npm run lint
```

## Features

- Create, edit, and delete notes inline
- Tag notes with quick add/remove controls
- Multi-tag filtering and full-text search
- Auto-persist notes to browser local storage
- Responsive glassmorphism UI tailored to mobile layouts

## Project Structure

```
app/
  layout.tsx        # Root layout, metadata, global styles
  page.tsx          # Main UI and client-side logic
  globals.css       # Mobile-first styling
```

## Deployment

Deploy directly to Vercel:

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-5dcbb33e
```

The production URL is `https://agentic-5dcbb33e.vercel.app`.
