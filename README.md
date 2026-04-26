# Development Portal

A full-stack web application for managing development projects, clients, and team collaboration. Built with React and Express, powered by Supabase.

## Tech Stack

### Client
- React 19 with TypeScript
- Vite (build tool)
- Tailwind CSS 4
- Zustand (state management)
- React Hook Form + Zod (form validation)
- React Router v7
- Recharts (data visualization)
- Axios (HTTP client)
- Lucide React (icons)

### Server
- Node.js with Express
- TypeScript
- Supabase (database & auth)
- JWT (authentication)
- Multer (file uploads)
- Zod (request validation)
- bcryptjs (password hashing)

## Project Structure

```
development-portal/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components (auth, admin, client, user)
│       ├── services/       # API service layer
│       ├── stores/         # Zustand state stores
│       ├── types/          # TypeScript type definitions
│       └── lib/            # Utility functions
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Environment & app configuration
│       ├── controllers/    # Route controllers
│       ├── middleware/      # Express middleware (auth, error handling)
│       ├── routes/         # API route definitions
│       ├── services/       # Business logic layer
│       ├── types/          # TypeScript type definitions
│       ├── utils/          # Utility functions
│       └── validators/     # Request validation schemas
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- Supabase project (for database and authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd development-portal
   ```

2. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:

   **Client** (`client/.env`):
   ```
   VITE_API_URL=http://localhost:5001/api
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

   **Server** (`server/.env`):
   ```
   PORT=5001
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=24h
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
   ```

### Running the Application

Start the server:
```bash
cd server
npm run dev
```

Start the client (in a separate terminal):
```bash
cd client
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5001`.

### Building for Production

```bash
# Build client
cd client && npm run build

# Build server
cd ../server && npm run build
npm start
```

## API Routes

| Route          | Description                  |
|----------------|------------------------------|
| `/api/auth`    | Authentication (login/register) |
| `/api/users`   | User management              |
| `/api/clients` | Client management            |
| `/api/projects`| Project management           |
| `/api/reports` | Reporting & analytics        |
| `/api/dashboard` | Dashboard data             |
| `/api/notifications` | User notifications     |
| `/api/profile` | User profile management      |
| `/api/settings`| Application settings         |

## Features

- User authentication with JWT
- Role-based access control (Admin, User, Client)
- Project management and tracking
- Client portal with dashboard
- Notifications system
- Reporting and analytics with charts
- Profile management
- File uploads
