# Development Portal - Client

React frontend for the Development Portal application.

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router v7** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client with interceptors
- **Recharts** - Charts and data visualization
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/         # Reusable UI components (Toast, Sidebar, Layout)
├── pages/
│   ├── auth/           # Login & Register pages
│   ├── admin/          # Admin pages (Users, Clients, Projects, Reports, Settings)
│   ├── client/         # Client portal (Projects, Dashboard)
│   └── user/           # User pages (Dashboard, assigned projects)
├── services/           # API service layer (axios calls)
├── stores/             # Zustand stores (auth, settings)
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## Setup

### Prerequisites

- Node.js v18+
- npm

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

For production, update `VITE_API_URL` to your deployed backend URL.

### Run Development Server

```bash
npm run dev
```

Runs on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output goes to `dist/`.

## Deployment (Vercel)

The `vercel.json` in this directory configures SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Role-Based Pages

| Role    | Routes                                | Description                    |
|---------|---------------------------------------|--------------------------------|
| Admin   | `/admin/dashboard`, `/admin/users`, `/admin/clients`, `/admin/projects`, `/admin/reports`, `/admin/settings` | Full management access |
| Client  | `/client/dashboard`, `/client/projects` | View own projects, update status |
| User    | `/user/dashboard`                     | View assigned projects          |
