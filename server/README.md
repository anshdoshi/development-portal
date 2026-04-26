# Development Portal - Server

Express.js backend API for the Development Portal application.

## Tech Stack

- **Node.js** with **Express**
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database with auto-generated APIs
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing (12 salt rounds)
- **Zod** - Request validation schemas
- **Multer** - File upload handling

## Project Structure

```
src/
├── config/             # Environment config, Supabase client
├── controllers/        # Route handlers
├── middleware/          # Auth, authorization, validation, error handling
├── routes/             # API route definitions
├── services/           # Business logic and database queries
├── types/              # TypeScript type definitions
├── utils/              # Helpers (JWT, password, logger, AppError)
└── validators/         # Zod validation schemas
```

## Setup

### Prerequisites

- Node.js v18+
- npm
- Supabase project

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=24h
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

For production, update `CLIENT_URL` to your deployed frontend URL.

### Run Development Server

```bash
npm run dev
```

Runs on `http://localhost:5001` with hot-reload via tsx.

### Build for Production

```bash
npm run build
npm start
```

## API Routes

All routes are prefixed with `/api`.

### Authentication

| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| POST   | `/api/auth/register`| Register new user | No   |
| POST   | `/api/auth/login`   | Login             | No   |
| POST   | `/api/auth/logout`  | Logout            | Yes  |
| GET    | `/api/auth/me`      | Get current user  | Yes  |

### Users (Admin only)

| Method | Endpoint                      | Description       |
|--------|-------------------------------|-------------------|
| GET    | `/api/users`                  | List users        |
| GET    | `/api/users/:id`              | Get user by ID    |
| POST   | `/api/users`                  | Create user       |
| PUT    | `/api/users/:id`              | Update user       |
| PATCH  | `/api/users/:id/deactivate`   | Deactivate user   |
| DELETE | `/api/users/:id`              | Delete user       |

### Clients (Admin only)

| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| GET    | `/api/clients`                  | List clients        |
| GET    | `/api/clients/:id`              | Get client by ID    |
| POST   | `/api/clients`                  | Create client       |
| PUT    | `/api/clients/:id`              | Update client       |
| PATCH  | `/api/clients/:id/deactivate`   | Deactivate client   |
| DELETE | `/api/clients/:id`              | Delete client       |

### Projects

| Method | Endpoint                              | Description          | Auth         |
|--------|---------------------------------------|----------------------|--------------|
| GET    | `/api/projects`                       | List projects        | All roles    |
| GET    | `/api/projects/:id`                   | Get project by ID    | All roles    |
| POST   | `/api/projects`                       | Create project       | Admin        |
| PUT    | `/api/projects/:id`                   | Update project       | Admin/Client |
| DELETE | `/api/projects/:id`                   | Delete project       | Admin        |
| POST   | `/api/projects/:id/assign`            | Assign user          | Admin        |
| DELETE | `/api/projects/:id/assign/:userId`    | Unassign user        | Admin        |

### Reports (Admin only)

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/reports`        | Get report data      |
| GET    | `/api/reports/export` | Export report as CSV  |

Query params: `type` (projects/users/activity), `startDate`, `endDate`

### Other

| Method | Endpoint                | Description           | Auth      |
|--------|-------------------------|-----------------------|-----------|
| GET    | `/api/dashboard/*`      | Dashboard data        | Per role  |
| GET    | `/api/notifications`    | List notifications    | Yes       |
| GET/PUT| `/api/profile`          | User profile          | Yes       |
| GET/PUT| `/api/settings`         | App settings          | Admin     |
| GET    | `/api/health`           | Health check          | No        |

## Deployment (Vercel)

The `vercel.json` in this directory configures the serverless deployment:

```json
{
  "version": 2,
  "builds": [{ "src": "src/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.ts" }]
}
```

Set all environment variables in the Vercel project dashboard (Settings > Environment Variables).

## Authentication Flow

1. User sends credentials to `POST /api/auth/login`
2. Server validates credentials and checks `is_active` status
3. Returns JWT token (expires in 24h by default)
4. Client sends token in `Authorization: Bearer <token>` header
5. `authenticate` middleware verifies token on protected routes
6. `requireRole()` middleware checks user role for admin-only routes
