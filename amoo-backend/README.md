# Amoo Guru — Backend (Node.js + Express + MySQL)

Production-grade REST API for the Amoo Guru spiritual/astrology platform
(users, experts, services, bookings, payments, refunds, wallets, subscriptions,
reports, packages, coupons, chat, testimonials, notifications, contacts, admin
dashboard, audit log).

## Stack
- Node.js + Express 4
- MySQL 8 via `mysql2` connection pool (with retries)
- JWT auth (access + refresh tokens, rotation, password reset OTP)
- Joi validation, helmet, CORS, compression, rate limiting
- Transactions for wallet / booking / payment / refund flows

## Quick start
```bash
cp .env.example .env        # fill in DB + JWT secrets
npm install
npm run migrate             # create schema (idempotent)
npm run seed                # seed demo data
npm run dev                 # nodemon
# or
npm start
```
Server listens on `PORT` (default 4000). Health: `GET /api/health`.

## Scripts
| Script | Purpose |
| --- | --- |
| `npm start` | Run the API |
| `npm run dev` | Run with nodemon |
| `npm run migrate` | Apply `src/schema.sql` idempotently |
| `npm run seed` | Insert demo admin/users/experts/services |

## Auth model
- `POST /api/auth/register` → access + httpOnly refresh cookie
- `POST /api/auth/login` / `admin/login`
- `POST /api/auth/refresh` → rotates refresh token
- `POST /api/auth/forgot-password` + `reset-password` (OTP based)
- `POST /api/auth/change-password` (authenticated, revokes other sessions)
- `POST /api/auth/logout` / `logout-all` (logout-all bumps `token_version`, revoking all sessions)
- `POST /api/auth/verify-email` + `verify-email/send`
- `GET /api/auth/me`
- Access tokens embed a `token_version`; changing password / logout-all invalidates them.
- Admin endpoints require `Authorization: Bearer <token>` with `kind: "admin"`.

## Endpoints (non-exhaustive)
| Resource | Routes |
| --- | --- |
| users | `GET /` (search/status/role/date), `/stats`, `/me`, `PATCH /me`, `/:id`, `PATCH /:id`, `DELETE /:id` (soft) |
| experts | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` (soft) |
| services | `GET /`, `GET /all`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` (soft) |
| slots | `GET /`, `POST /`, `PATCH /:id` (status), `DELETE /:id` |
| bookings | `GET /` (filters), `GET /:id`, `POST /` (txn), `PATCH /:id`, `DELETE /:id`, `POST /:id/complete` |
| payments | `GET /`, `POST /`, `POST /:id/refund`, `GET /refunds`, `POST /webhook`, `GET /stats/overview` |
| wallet | `GET /` (history), `credit`, `debit`, `transfer`, `low-balance` (admin), `admin/adjust` |
| subscriptions | `GET /`, `POST /`, `POST /:id/cancel` (self/admin), `GET /all` (filters), `PATCH /:id`, `POST /expire` (cron) |
| reports | `GET /`, `GET /:id`, `POST /`, `POST /admin`, `PATCH /:id`, `DELETE /:id` (soft), `GET /:id/download` |
| packages | `GET /`, `GET /all`, `POST /`, `PATCH /:id`, `DELETE /:id` (soft) |
| coupons | `GET /`, `POST /`, `POST /validate`, `POST /apply`, `PATCH /:id`, `DELETE /:id` |
| chat | `GET /conversations`, `POST /conversations`, `POST /conversations/:id/read`, `GET/POST /conversations/:id/messages` |
| notifications | `GET /`, `/unread-count`, `POST /:id/read`, `POST /read-all`, `DELETE /:id`, `POST /` (admin), `GET /all` |
| contacts | `POST /`, `GET /` (filters), `GET /:id`, `PATCH /:id` (status/reply), `DELETE /:id` |
| uploads | `POST /` (multipart), `GET /`, `GET /all` (admin), `DELETE /:id` |
| dashboard | `GET /overview`, `/revenue`, `/bookings/trends`, `/users/growth`, `/experts/top`, `/export/:type` (CSV) |
| audit | `GET /` (filters) |

## Notable security & reliability features
- Helmet headers, CORS restricted to `CLIENT_ORIGIN`, compression, rate limiting
- Passwords hashed with bcrypt (cost 12)
- Parameterized queries everywhere; dynamic `UPDATE`s use field whitelists
- Wallets/bookings/payments/refunds run in DB transactions with `FOR UPDATE` row locks
- Soft-delete (`deleted_at`) on all admin-managed entities
- Audit logging on every mutation (`/api/audit`, filterable)
- Request correlation id (`X-Request-Id`)
- Pagination + search + filters on list endpoints (`?page&limit&search&status&type&category&date_from&date_to&expert_id&user_id&method`)
- Uniform JSON envelope: `{ success, data, meta?, error?, details? }`
- Central error handler (no stack leaks in production)
- Graceful shutdown on `SIGTERM`/`SIGINT`

## Database
Single source of truth: `src/schema.sql` (create-if-not-exists + indexes).
New tables vs. earlier versions: `refunds`, `conversations`/`messages`,
`coupons`, `audit_log`, and `reset_otp` columns on `users`.

## Default credentials (after seed)
- Admin: `admin@amooguru.com` / `admin123`
- User:  `vedika.desai@gmail.com` / `user123`
