# Amoo Guru — Backend (Node.js + Express + MySQL)

REST API for the Amoo Guru spiritual/astrology platform (users, experts,
services, bookings, payments, slots, reports, packages, testimonials, admin
dashboard).

## Stack
- Node.js + Express 4
- MySQL (mysql2 connection pool)
- JWT auth (jsonwebtoken + bcryptjs)
- CORS

## Prerequisites
1. **Node.js** (already installed: v25.x) — `node --version`
2. **MySQL server** — NOT installed yet. Install one of:
   - MySQL Community Server: https://dev.mysql.com/downloads/installer/
   - Or XAMPP / WAMP (bundles MySQL)
   - Or run via Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=your_mysql_password mysql:8`

   Make sure the MySQL service is running and note the root password.

## Setup
```bash
cd D:\amoo-web\amoo-backend
npm install
cp .env.example .env        # then edit DB_PASSWORD and JWT_SECRET
```

Edit `.env` and set at least:
```
DB_PASSWORD=your_mysql_password
JWT_SECRET=some_long_random_string
```

## Create database + tables
```bash
mysql -u root -p < src/schema.sql
```
(or paste the contents of `src/schema.sql` into your MySQL client)

## Seed sample data (optional)
```bash
npm run seed
```
Creates an admin (`admin@amooguru.com` / `admin123`) and a user
(`vedika.desai@gmail.com` / `user123`) plus experts, services and packages.

## Run
```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```
API runs at http://localhost:4000 — try http://localhost:4000/api/health

## Connect the frontend
In the Next.js frontend (`D:\amoo-web\amoo-web\amoo-web`), call the API at
`http://localhost:4000/api/...`. Set `CLIENT_ORIGIN` in `.env` to your
frontend URL (default http://localhost:3000) so CORS allows it.

## API endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | – | Health check |
| POST | `/api/auth/register` | – | Register user (validated) |
| POST | `/api/auth/login` | – | User login → JWT |
| POST | `/api/auth/admin/login` | – | Admin login → JWT |
| GET | `/api/auth/me` | user | Current profile |
| GET | `/api/users` | admin | List users |
| GET/PATCH | `/api/users/me` | user | Own profile |
| GET | `/api/experts` | – | List experts |
| GET | `/api/services` | – | List active services |
| POST | `/api/services` | admin | Create service (validated) |
| POST | `/api/bookings` | user | Create booking (+payment, validated) |
| GET | `/api/bookings` | user/admin | List bookings |
| POST | `/api/payments` | user | Record payment (validated) |
| GET | `/api/slots` | – | List availability slots |
| GET/POST | `/api/reports` | user | Reports (validated) |
| GET | `/api/packages` | – | Packages/offers |
| GET | `/api/testimonials` | – | Testimonials |
| GET | `/api/dashboard/overview` | admin | Admin stats |
| GET/POST `/credit` `/debit` | `/api/wallet` | user | Wallet balance + transactions |
| GET/POST | `/api/subscriptions` | user | View/subscribe to plans |
| GET `/unread-count` POST `/:id/read` | `/api/notifications` | user | Notifications |
| POST | `/api/contact` | – | Public enquiry (validated) |
| POST/GET | `/api/uploads` | user | File upload (multer, /uploads served statically) |

Send the JWT as header: `Authorization: Bearer <token>`.

### Validation
Request bodies are validated with Joi (`src/middleware/validate.js`). Invalid
input returns `400` with a `details` array.

### File uploads
`POST /api/uploads` (multipart, field name `file`, max 5MB) stores the file
under `uploads/` and returns `{ url }`. Files are served at `/uploads/<file>`.

### Frontend wiring
The Next.js frontend (`D:\amoo-web\amoo-web\amoo-web`) uses `lib/api.ts`
(API client) and `lib/useApi.ts` (data hook). Set `NEXT_PUBLIC_API_URL`
(default `http://localhost:4000`) in `.env.local`. Public pages (Services,
Testimonials, Contact) and the user Wallet are wired to live API data with
graceful fallback to static content when the backend is offline.
