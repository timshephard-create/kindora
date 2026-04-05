# Famly

A family navigation platform with four tools to help families find care, understand health options, make smart screen time choices, and eat well on a budget.

## Tools

- **Sprout** (`/sprout`) — Childcare navigation: find providers, discover savings programs
- **HealthGuide** (`/health-guide`) — Health insurance recommendations with real CMS Marketplace plan data
- **BrightWatch** (`/bright-watch`) — Age-appropriate media recommendations for young children
- **Nourish** (`/nourish`) — Budget-smart meal planning with nearby store discovery

## Tech Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Google Places API (server-side), Anthropic Claude API (server-side)
- Brevo (transactional email), Airtable (CRM/leads)
- PWA-ready, Capacitor-compatible

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Google Places API key (Nearby Search + Geocoding) |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude Sonnet) |
| `AIRTABLE_API_KEY` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base ID |
| `AIRTABLE_TABLE_NAME` | Airtable table name (default: `leads`) |
| `BREVO_API_KEY` | Brevo SMTP API key |
| `BREVO_FROM_EMAIL` | Sender email address |
| `BREVO_FROM_NAME` | Sender display name |
| `CMS_MARKETPLACE_API_KEY` | CMS Marketplace API key (optional, for real health plans) |

All API keys are server-side only. None are exposed to the client bundle.

### CMS Marketplace API (free, optional)

HealthGuide uses the CMS Marketplace API to show real health insurance plans with real premiums. Without this key, the tool still works using deterministic recommendations.

1. Go to https://developer.cms.gov/marketplace-api/key-request.html
2. Fill out the request form (name, email, intended use: family health insurance tool)
3. Key is emailed within 1-2 business days
4. Add as `CMS_MARKETPLACE_API_KEY` in your `.env.local` and Vercel env vars

## Deploy to Vercel

1. Push to GitHub
2. Import into Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Capacitor (Android)

```bash
# Build static export
NEXT_EXPORT=true npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Rename / Rebrand

All platform and tool names are config-driven. Edit `config/platform.ts` to rename everything:

- `PLATFORM.name` — changes the platform name everywhere
- `PLATFORM.tagline` — changes the hero tagline
- `TOOLS.childcare.name` — changes "Sprout" to whatever you want
- etc.

No other files need to be modified. Every page title, nav label, email subject, and meta tag pulls from this single config file.

## Project Structure

```
config/platform.ts    — Single source of truth for all names/colors/metadata
app/
  page.tsx            — Hub (tool selection)
  sprout/             — Childcare tool
  health-guide/       — Health insurance tool
  bright-watch/       — Media quality tool
  nourish/            — Meal planning tool
  api/                — Server-side API routes
components/           — Shared UI components
lib/                  — Server-side logic (places, savings, healthguide, airtable, email)
types/                — Shared TypeScript types
```
