# TransformAI Frontend

Frontend application for **TransformAI — GenAI Content Transformation Platform**, built for **Smart India Hackathon 2026 · SIH26154**.

The frontend provides a secure, responsive workspace for uploading source content, configuring transformations, reviewing AI-generated outputs, exporting results, and monitoring documents, history, analytics, and profile settings.

---

## Tech Stack

- Next.js 16
- React
- TypeScript
- App Router
- Tailwind CSS 4
- shadcn/ui / Base UI primitives
- TanStack Query
- Recharts
- Supabase Auth
- Lucide React
- Sonner

---

## Design System

TransformAI uses a premium enterprise AI interface with:

- Obsidian-inspired dark surfaces
- Warm ivory light theme
- Champagne-gold accents
- Responsive layouts
- Consistent cards and buttons
- Accessible focus states
- Light and dark themes
- Loading, error, empty, and 404 states
- Mobile, tablet, laptop, and desktop support

The interface intentionally avoids excessive glassmorphism and keeps the presentation professional and readable.

---

## Main Routes

```text
/
├── /login
├── /signup
├── /forgot-password
├── /reset-password
├── /dashboard
├── /transform
├── /documents
├── /documents/[documentId]
├── /history
├── /analytics
├── /results/[transformationId]
└── /settings
```

Additional application routes include:

```text
/auth/callback
/auth/confirm
/manifest.webmanifest
/robots.txt
/sitemap.xml
```

---

## Main Modules

### Landing Page

Introduces TransformAI, the content transformation workflow, major capabilities, security architecture, and supported outputs.

### Authentication

Supports:

- Sign up
- Login
- Forgot password
- Reset password
- Supabase authentication callbacks

### Dashboard

Displays workspace-level information such as:

- documents
- transformations
- generated outputs
- success metrics
- recent activity
- source distribution
- usage trends

### Transform Studio

The main AI transformation workflow.

Users can:

- upload a source file
- enter text directly
- prepare the source
- choose audience
- choose tone
- choose language
- choose detail level
- define an objective
- add custom instructions
- enable / disable RAG
- select output types
- start a transformation

### Documents

Provides:

- document search
- input-type filters
- processing status
- document details
- extracted content
- metadata
- RAG status
- transformation count
- delete actions

### History

Displays previous transformations with status, selected outputs, and result navigation.

### Analytics

Provides visual insight into source usage, transformation activity, success rates, and other workspace metrics.

### Results Workspace

Displays:

- transformation settings
- content intelligence
- generated output navigation
- structured content viewer
- copy-output action
- source-document link
- export center

### Export Center

Supports:

- PDF
- DOCX
- PPTX
- JSON
- CSV
- SRT

SRT export is enabled when the transformation includes a Video Script output.

### Settings

Includes:

- profile information
- theme preferences
- account role
- security information

---

## Project Structure

```text
frontend/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── auth/
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── history/
│   │   ├── landing/
│   │   ├── layout/
│   │   ├── results/
│   │   ├── settings/
│   │   ├── shared/
│   │   ├── transform/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── api/
│   │   └── utils/
│   │
│   ├── providers/
│   └── types/
│
├── public/
├── package.json
├── next.config.ts
└── README.md
```

---

## Local Setup

### 1. Install dependencies

```powershell
cd frontend
npm install
```

### 2. Configure environment

Create:

```text
frontend/.env.local
```

Configure the public frontend environment variables required by the application.

Typical values include:

```text
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Do not commit `.env.local`.

### 3. Start development server

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## API Integration

The frontend communicates with the FastAPI backend through the API client layer under:

```text
src/lib/api/
```

Major API domains include:

- documents
- transformations
- RAG
- exports
- dashboard
- analytics
- profile

---

## Authentication

Authentication is handled by Supabase Auth.

Protected application pages require an authenticated session. Backend requests use the authenticated user identity for authorization and per-user data isolation.

Production deployment must update the relevant Supabase site URL and redirect URLs.

---

## Responsive Support

The UI was designed and tested for:

```text
375px   Mobile
768px   Tablet
1024px  Laptop
1440px  Desktop
```

Important pages were also verified in light and dark themes.

---

## Production Quality Checks

Run:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

The finalized frontend passed:

- TypeScript check
- ESLint
- Next.js production build

---

## Production Deployment

Recommended platform:

**Vercel**

Before deployment, configure production values for:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

After deployment, update Supabase Auth URLs for the production frontend domain.

---

## Live URL

```text
Coming after production deployment.
```

---

## Related Documentation

For complete architecture, backend setup, AI/RAG details, security, and the full demo flow, see:

```text
../README.md
```
