const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const env = require("./env");

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: access_token
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error: { type: string }
 *         details: { type: array, items: { type: string } }
 *     Pagination:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         pageSize: { type: integer }
 *         total: { type: integer }
 *         totalPages: { type: integer }
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         data: { type: array, items: { type: object } }
 *         meta: { $ref: '#/components/schemas/Pagination' }
 */

// ─────────────────────────────── AUTH ───────────────────────────────

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 120, example: "John Doe" }
 *               email: { type: string, format: email, example: "john@example.com" }
 *               phone: { type: string, maxLength: 20, example: "+919876543210" }
 *               password: { type: string, minLength: 8, maxLength: 128, example: "SecurePass123" }
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email & password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { description: Invalid credentials }
 *       423: { description: Account locked }
 */

/**
 * @openapi
 * /api/auth/admin/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 */

/**
 * @openapi
 * /api/auth/expert/login:
 *   post:
 *     tags: [Auth]
 *     summary: Expert login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Expert login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 expert: { $ref: '#/components/schemas/Expert' }
 */

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token (rotate refresh token)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token: { type: string }
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (clear auth cookies)
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */

/**
 * @openapi
 * /api/auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout of all sessions (revoke every session)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All sessions revoked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (authenticated)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, password]
 *             properties:
 *               current_password: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password updated
 */

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Complete email verification with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token]
 *             properties:
 *               email: { type: string, format: email }
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 */

/**
 * @openapi
 * /api/auth/verify-email/send:
 *   post:
 *     tags: [Auth]
 *     summary: Send verification email (authenticated)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Verification email sent
 */

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP sent if account exists
 */

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, password]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, pattern: "^[0-9]{4,10}$" }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password reset
 */

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user/admin/expert profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kind: { type: string, enum: [user, admin, expert] }
 *                 data: { type: object }
 */

// ─────────────────────────────── USERS ───────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         avatar: { type: string }
 *         role: { type: string, enum: [free, premium, consultant] }
 *         status: { type: string, enum: [active, blocked, pending] }
 *         verified: { type: boolean }
 *         created_at: { type: string, format: date-time }
 *
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: role, schema: { type: string } }
 *       - { in: query, name: verified, schema: { type: string, enum: ["0", "1"] } }
 *       - { in: query, name: date_from, schema: { type: string, format: date } }
 *       - { in: query, name: date_to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/User' } }
 */

/**
 * @openapi
 * /api/users/stats:
 *   get:
 *     tags: [Users]
 *     summary: User statistics (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: integer }
 *                 active: { type: integer }
 *                 premium: { type: integer }
 *                 today: { type: integer }
 *                 byRole: { type: array, items: { type: object } }
 */

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   patch:
 *     tags: [Users]
 *     summary: Update own profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               avatar: { type: string }
 *               dob: { type: string, format: date }
 *               tob: { type: string }
 *               birthplace: { type: string }
 *               gender: { type: string }
 *               language: { type: string }
 *               country: { type: string }
 *               state: { type: string }
 *               city: { type: string }
 *               address: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: User details
 *   patch:
 *     tags: [Users]
 *     summary: Update user (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               role: { type: string, enum: [free, premium, consultant] }
 *               status: { type: string, enum: [active, blocked, pending] }
 *               verified: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     tags: [Users]
 *     summary: Soft-delete user (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: User deleted
 */

// ─────────────────────────────── EXPERTS ───────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     Expert:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         avatar: { type: string }
 *         role_title: { type: string }
 *         bio: { type: string }
 *         specialties: { type: string }
 *         rating: { type: number }
 *         status: { type: string, enum: [active, inactive] }
 *         created_at: { type: string, format: date-time }
 *
 * /api/experts:
 *   get:
 *     tags: [Experts]
 *     summary: "List experts (public: active only; admin: all with ?all=1)"
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: all, schema: { type: string, enum: ["1"] }, description: "Admin: show all" }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated expert list
 *   post:
 *     tags: [Experts]
 *     summary: Create expert (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               avatar: { type: string }
 *               role_title: { type: string }
 *               bio: { type: string }
 *               specialties: { type: string }
 *               rating: { type: number, minimum: 0, maximum: 5 }
 *     responses:
 *       201:
 *         description: Expert created
 */

/**
 * @openapi
 * /api/experts/{id}:
 *   get:
 *     tags: [Experts]
 *     summary: Get expert by ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Expert details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expert'
 *   patch:
 *     tags: [Experts]
 *     summary: Update expert (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               avatar: { type: string }
 *               role_title: { type: string }
 *               bio: { type: string }
 *               specialties: { type: string }
 *               rating: { type: number }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Expert updated
 *   delete:
 *     tags: [Experts]
 *     summary: Soft-delete expert (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Expert deleted
 */

/**
 * @openapi
 * /api/experts/{id}/set-password:
 *   post:
 *     tags: [Experts]
 *     summary: Set/reset expert password (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password set
 */

// ─────────────────────────────── SERVICES ───────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         sub: { type: string }
 *         img: { type: string }
 *         category: { type: string, enum: [Numerology, Tarot, Astrology, Healing, Vastu, "AI Services", Spiritual] }
 *         type: { type: string, enum: [Report, Consultation, Chat] }
 *         price: { type: number }
 *         duration: { type: string }
 *         status: { type: string, enum: [Active, Inactive] }
 *
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: List active services (public)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: type, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated service list
 *   post:
 *     tags: [Services]
 *     summary: Create service (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, type, price]
 *             properties:
 *               name: { type: string, maxLength: 160 }
 *               sub: { type: string }
 *               img: { type: string }
 *               category: { type: string, enum: [Numerology, Tarot, Astrology, Healing, Vastu, "AI Services", Spiritual] }
 *               type: { type: string, enum: [Report, Consultation, Chat] }
 *               price: { type: number, minimum: 0 }
 *               duration: { type: string }
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       201:
 *         description: Service created
 */

/**
 * @openapi
 * /api/services/all:
 *   get:
 *     tags: [Services]
 *     summary: List all services (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: type, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated all services
 */

/**
 * @openapi
 * /api/services/{id}:
 *   get:
 *     tags: [Services]
 *     summary: Get service by ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Service details
 *   patch:
 *     tags: [Services]
 *     summary: Update service (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               sub: { type: string }
 *               img: { type: string }
 *               category: { type: string }
 *               type: { type: string }
 *               price: { type: number }
 *               duration: { type: string }
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       200:
 *         description: Service updated
 *   delete:
 *     tags: [Services]
 *     summary: Soft-delete service (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Service deleted
 */

// ─────────────────────────────── BOOKINGS ───────────────────────────────

/**
 * @openapi
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         booking_ref: { type: string }
 *         user_id: { type: integer }
 *         expert_id: { type: integer }
 *         service_id: { type: integer }
 *         slot_id: { type: integer }
 *         date: { type: string, format: date }
 *         time: { type: string }
 *         mode: { type: string, enum: [chat, video, in-person] }
 *         amount: { type: number }
 *         payment: { type: string, enum: [Paid, Pending] }
 *         status: { type: string, enum: [pending-payment, upcoming, completed, cancelled] }
 *         notes: { type: string }
 *
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: "List bookings (user: own; admin: all)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: expert_id, schema: { type: integer } }
 *       - { in: query, name: service_id, schema: { type: integer } }
 *       - { in: query, name: user_id, schema: { type: integer } }
 *       - { in: query, name: date_from, schema: { type: string, format: date } }
 *       - { in: query, name: date_to, schema: { type: string, format: date } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated bookings
 *   post:
 *     tags: [Bookings]
 *     summary: Create booking (authenticated + verified)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service_id, date, time, amount]
 *             properties:
 *               service_id: { type: integer }
 *               expert_id: { type: integer }
 *               slot_id: { type: integer }
 *               date: { type: string, format: date }
 *               time: { type: string }
 *               mode: { type: string, enum: [chat, video, in-person] }
 *               amount: { type: number }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Booking created
 */

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Booking details
 *   patch:
 *     tags: [Bookings]
 *     summary: Update booking (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [upcoming, completed, cancelled, pending-payment] }
 *               payment: { type: string, enum: [Paid, Pending] }
 *               expert_id: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Booking updated
 *   delete:
 *     tags: [Bookings]
 *     summary: Cancel booking (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */

/**
 * @openapi
 * /api/bookings/{id}/complete:
 *   post:
 *     tags: [Bookings]
 *     summary: Mark booking completed (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Booking completed
 */

// ─────────────────────────────── PAYMENTS ───────────────────────────────

/**
 * @openapi
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: "List payments (user: own; admin: all)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: method, schema: { type: string } }
 *       - { in: query, name: user_id, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated payments
 *   post:
 *     tags: [Payments]
 *     summary: Record a pending payment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_id: { type: integer }
 *               subscription_id: { type: integer }
 *               method: { type: string }
 *               txn_id: { type: string }
 *               gateway: { type: string }
 *     responses:
 *       201:
 *         description: Payment recorded
 */

/**
 * @openapi
 * /api/payments/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create Razorpay order for a booking or subscription
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_id: { type: integer }
 *               subscription_id: { type: integer }
 *     responses:
 *       200:
 *         description: Razorpay order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id: { type: string }
 *                 amount: { type: integer }
 *                 currency: { type: string }
 *                 key_id: { type: string }
 *                 payment_id: { type: integer }
 */

/**
 * @openapi
 * /api/payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify Razorpay payment after frontend checkout
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_payment_id, razorpay_order_id, razorpay_signature]
 *             properties:
 *               booking_id: { type: integer }
 *               razorpay_payment_id: { type: string }
 *               razorpay_order_id: { type: string }
 *               razorpay_signature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified
 */

/**
 * @openapi
 * /api/payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Refund a payment (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Payment refunded
 */

/**
 * @openapi
 * /api/payments/refunds:
 *   get:
 *     tags: [Payments]
 *     summary: List refunds (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated refunds
 */

/**
 * @openapi
 * /api/payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Payment gateway webhook (Razorpay / Stripe)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 */

/**
 * @openapi
 * /api/payments/stats/overview:
 *   get:
 *     tags: [Payments]
 *     summary: Payment statistics overview (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Payment stats
 */

// ─────────────────────────────── SLOTS ───────────────────────────────

/**
 * @openapi
 * /api/slots:
 *   get:
 *     tags: [Slots]
 *     summary: List slots (public, filterable)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: expert_id, schema: { type: integer } }
 *       - { in: query, name: date, schema: { type: string, format: date } }
 *       - { in: query, name: status, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated slots
 *   post:
 *     tags: [Slots]
 *     summary: Create slot (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [expert_id, date, start_time]
 *             properties:
 *               expert_id: { type: integer }
 *               date: { type: string, format: date }
 *               start_time: { type: string }
 *               end_time: { type: string }
 *               status: { type: string, enum: [available, booked, blocked] }
 *     responses:
 *       201:
 *         description: Slot created
 */

/**
 * @openapi
 * /api/slots/availability:
 *   get:
 *     tags: [Slots]
 *     summary: Per-expert slot utilisation (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: date, schema: { type: string, format: date } }
 *       - { in: query, name: date_from, schema: { type: string, format: date } }
 *       - { in: query, name: date_to, schema: { type: string, format: date } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Slot utilisation data
 */

/**
 * @openapi
 * /api/slots/{id}:
 *   patch:
 *     tags: [Slots]
 *     summary: Update slot status (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [available, booked, blocked] }
 *     responses:
 *       200:
 *         description: Slot updated
 *   delete:
 *     tags: [Slots]
 *     summary: Delete slot (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Slot deleted
 */

// ─────────────────────────────── SUBSCRIPTIONS ───────────────────────────────

/**
 * @openapi
 * /api/subscriptions:
 *   get:
 *     tags: [Subscriptions]
 *     summary: List own subscriptions (authenticated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated subscriptions
 *   post:
 *     tags: [Subscriptions]
 *     summary: Subscribe to a package
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               package_id: { type: integer }
 *               plan_name: { type: string }
 *               duration_days: { type: integer }
 *               auto_renew: { type: boolean }
 *     responses:
 *       201:
 *         description: Subscription created
 */

/**
 * @openapi
 * /api/subscriptions/all:
 *   get:
 *     tags: [Subscriptions]
 *     summary: List all subscriptions (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: user_id, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated subscriptions
 */

/**
 * @openapi
 * /api/subscriptions/{id}/cancel:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Cancel subscription (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */

/**
 * @openapi
 * /api/subscriptions/{id}:
 *   patch:
 *     tags: [Subscriptions]
 *     summary: Update subscription (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [active, expired, cancelled, pending-payment] }
 *               auto_renew: { type: boolean }
 *               plan_name: { type: string }
 *               expires_at: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Subscription updated
 */

/**
 * @openapi
 * /api/subscriptions/expire:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Run subscription expiry job (admin/cron)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Expired subscriptions processed
 */

// ─────────────────────────────── COUPONS ───────────────────────────────

/**
 * @openapi
 * /api/coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: List coupons (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, inactive] } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated coupons
 *   post:
 *     tags: [Coupons]
 *     summary: Create coupon (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discount_type, discount_value]
 *             properties:
 *               code: { type: string, minLength: 3, maxLength: 30 }
 *               description: { type: string }
 *               discount_type: { type: string, enum: [percent, flat] }
 *               discount_value: { type: number, minimum: 0 }
 *               min_amount: { type: number, minimum: 0 }
 *               max_uses: { type: integer, minimum: 1 }
 *               expires_at: { type: string, format: date-time }
 *               active: { type: boolean }
 *     responses:
 *       201:
 *         description: Coupon created
 */

/**
 * @openapi
 * /api/coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Validate a coupon code (public, used at checkout)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *               amount: { type: number }
 *     responses:
 *       200:
 *         description: Coupon validation result
 */

/**
 * @openapi
 * /api/coupons/apply:
 *   post:
 *     tags: [Coupons]
 *     summary: Apply coupon to a booking
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, booking_id]
 *             properties:
 *               code: { type: string }
 *               booking_id: { type: integer }
 *     responses:
 *       200:
 *         description: Coupon applied
 */

/**
 * @openapi
 * /api/coupons/{id}:
 *   patch:
 *     tags: [Coupons]
 *     summary: Update coupon (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Coupon updated
 *   delete:
 *     tags: [Coupons]
 *     summary: Delete coupon (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Coupon deleted
 */

// ─────────────────────────────── CHAT ───────────────────────────────

/**
 * @openapi
 * /api/chat/conversations:
 *   post:
 *     tags: [Chat]
 *     summary: Start or resume a conversation with an expert
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participant_id]
 *             properties:
 *               participant_id: { type: integer, description: "Expert ID" }
 *     responses:
 *       200:
 *         description: Conversation
 *   get:
 *     tags: [Chat]
 *     summary: List my conversations
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated conversations
 */

/**
 * @openapi
 * /api/chat/conversations/{id}/read:
 *   post:
 *     tags: [Chat]
 *     summary: Mark messages as read in a conversation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Messages marked as read
 */

/**
 * @openapi
 * /api/chat/conversations/{id}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages in a conversation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated messages
 *   post:
 *     tags: [Chat]
 *     summary: Send a message in a conversation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 5000 }
 *     responses:
 *       201:
 *         description: Message sent
 */

/**
 * @openapi
 * /api/chat/unread-count:
 *   get:
 *     tags: [Chat]
 *     summary: Get unread message count for badge
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 */

// ─────────────────────────────── NOTIFICATIONS ───────────────────────────────

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List own + broadcast notifications
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated notifications
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               user_id: { type: integer, description: "null for broadcast" }
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string, default: info }
 *     responses:
 *       201:
 *         description: Notification created
 */

/**
 * @openapi
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread count
 */

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Marked read
 */

/**
 * @openapi
 * /api/notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All marked read
 */

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Notification deleted
 */

/**
 * @openapi
 * /api/notifications/all:
 *   get:
 *     tags: [Notifications]
 *     summary: List all notifications (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated all notifications
 */

// ─────────────────────────────── TESTIMONIALS ───────────────────────────────

/**
 * @openapi
 * /api/testimonials:
 *   get:
 *     tags: [Testimonials]
 *     summary: List active testimonials (public)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated testimonials
 *   post:
 *     tags: [Testimonials]
 *     summary: Submit testimonial (authenticated, queued for approval)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       201:
 *         description: Testimonial submitted (pending approval)
 */

/**
 * @openapi
 * /api/testimonials/all:
 *   get:
 *     tags: [Testimonials]
 *     summary: List all testimonials (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated all testimonials
 */

/**
 * @openapi
 * /api/testimonials/{id}:
 *   patch:
 *     tags: [Testimonials]
 *     summary: Update testimonial (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [Active, Inactive] }
 *               comment: { type: string }
 *               rating: { type: integer }
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Testimonial updated
 *   delete:
 *     tags: [Testimonials]
 *     summary: Soft-delete testimonial (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Testimonial deleted
 */

// ─────────────────────────────── CONTACT ───────────────────────────────

/**
 * @openapi
 * /api/contact:
 *   post:
 *     tags: [Contact]
 *     summary: Submit contact form enquiry (public, with honeypot)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *               honeypot: { type: string, description: "Hidden field - bots fill this" }
 *     responses:
 *       201:
 *         description: Message received
 *   get:
 *     tags: [Contact]
 *     summary: List contact enquiries (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: date_from, schema: { type: string, format: date } }
 *       - { in: query, name: date_to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Paginated enquiries
 */

/**
 * @openapi
 * /api/contact/{id}:
 *   get:
 *     tags: [Contact]
 *     summary: Get contact enquiry (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Enquiry details
 *   patch:
 *     tags: [Contact]
 *     summary: Update contact status/reply (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [new, replied, closed] }
 *               reply: { type: string }
 *     responses:
 *       200:
 *         description: Contact updated
 *   delete:
 *     tags: [Contact]
 *     summary: Delete contact enquiry (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Enquiry deleted
 */

// ─────────────────────────────── UPLOADS ───────────────────────────────

/**
 * @openapi
 * /api/uploads:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload a file (authenticated)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: File uploaded
 *   get:
 *     tags: [Uploads]
 *     summary: List own uploaded files
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated uploads
 */

/**
 * @openapi
 * /api/uploads/all:
 *   get:
 *     tags: [Uploads]
 *     summary: List all uploads (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated uploads
 */

/**
 * @openapi
 * /api/uploads/{id}/download:
 *   get:
 *     tags: [Uploads]
 *     summary: Download file by ID (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @openapi
 * /api/uploads/{id}:
 *   delete:
 *     tags: [Uploads]
 *     summary: Delete uploaded file (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: File deleted
 */

// ─────────────────────────────── DASHBOARD ───────────────────────────────

/**
 * @openapi
 * /api/dashboard/overview:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard overview stats (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard stats
 */

/**
 * @openapi
 * /api/dashboard/revenue:
 *   get:
 *     tags: [Dashboard]
 *     summary: Revenue breakdown by period (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: period, schema: { type: string, enum: [day, week, month, year] } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Revenue data
 */

/**
 * @openapi
 * /api/dashboard/bookings/trends:
 *   get:
 *     tags: [Dashboard]
 *     summary: Booking trends by period (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: period, schema: { type: string, enum: [day, week, month, year] } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Booking trends
 */

/**
 * @openapi
 * /api/dashboard/users/growth:
 *   get:
 *     tags: [Dashboard]
 *     summary: User growth by period (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: period, schema: { type: string, enum: [day, week, month, year] } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: User growth data
 */

/**
 * @openapi
 * /api/dashboard/revenue/by-service:
 *   get:
 *     tags: [Dashboard]
 *     summary: Revenue by service (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Revenue by service
 */

/**
 * @openapi
 * /api/dashboard/reports/by-type:
 *   get:
 *     tags: [Dashboard]
 *     summary: Report counts by type (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Report type breakdown
 */

/**
 * @openapi
 * /api/dashboard/experts/top:
 *   get:
 *     tags: [Dashboard]
 *     summary: Top performing experts (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: limit, schema: { type: integer, default: 5 } }
 *     responses:
 *       200:
 *         description: Top experts
 */

/**
 * @openapi
 * /api/dashboard/bookings/patterns:
 *   get:
 *     tags: [Dashboard]
 *     summary: Booking patterns (day/hour distribution) (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Booking patterns
 */

/**
 * @openapi
 * /api/dashboard/export/{type}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Export data as CSV (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: type, required: true, schema: { type: string, enum: [bookings, users, payments] } }
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */

// ─────────────────────────────── REPORTS ───────────────────────────────

/**
 * @openapi
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: "List reports (user: own; admin: all)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: type, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: user_id, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated reports
 *   post:
 *     tags: [Reports]
 *     summary: Create a report (with optional auto-generation)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               service_id: { type: integer }
 *               type: { type: string }
 *               title: { type: string }
 *               content: { type: string }
 *               file_url: { type: string }
 *     responses:
 *       201:
 *         description: Report created
 */

/**
 * @openapi
 * /api/reports/stats:
 *   get:
 *     tags: [Reports]
 *     summary: Get user's report statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Report stats
 */

/**
 * @openapi
 * /api/reports/admin:
 *   post:
 *     tags: [Reports]
 *     summary: Create report for any user (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, title]
 *             properties:
 *               user_id: { type: integer }
 *               service_id: { type: integer }
 *               type: { type: string }
 *               title: { type: string }
 *               content: { type: string }
 *               file_url: { type: string }
 *     responses:
 *       201:
 *         description: Report created
 */

/**
 * @openapi
 * /api/reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get report by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Report details
 *   patch:
 *     tags: [Reports]
 *     summary: Update report (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, ready, rejected] }
 *               title: { type: string }
 *               content: { type: string }
 *               file_url: { type: string }
 *     responses:
 *       200:
 *         description: Report updated
 *   delete:
 *     tags: [Reports]
 *     summary: Soft-delete report (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Report deleted
 */

/**
 * @openapi
 * /api/reports/{id}/download:
 *   get:
 *     tags: [Reports]
 *     summary: Download report file (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: File download
 */

// ─────────────────────────────── WALLET ───────────────────────────────

/**
 * @openapi
 * /api/wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Get wallet balance & transaction history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Wallet data
 */

/**
 * @openapi
 * /api/wallet/credit:
 *   post:
 *     tags: [Wallet]
 *     summary: (DEPRECATED) Wallet top-up — redirect to payment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       403:
 *         description: Use payment flow instead
 */

/**
 * @openapi
 * /api/wallet/admin/credit:
 *   post:
 *     tags: [Wallet]
 *     summary: Admin credit wallet
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, amount]
 *             properties:
 *               user_id: { type: integer }
 *               amount: { type: number }
 *               reason: { type: string }
 *               ref: { type: string }
 *     responses:
 *       200:
 *         description: Wallet credited
 */

/**
 * @openapi
 * /api/wallet/debit:
 *   post:
 *     tags: [Wallet]
 *     summary: Debit wallet (with balance check)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number }
 *               reason: { type: string }
 *               ref: { type: string }
 *     responses:
 *       200:
 *         description: Wallet debited
 */

/**
 * @openapi
 * /api/wallet/transfer:
 *   post:
 *     tags: [Wallet]
 *     summary: Transfer funds to another user
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to_user_id, amount]
 *             properties:
 *               to_user_id: { type: integer }
 *               amount: { type: number }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Transfer complete
 */

/**
 * @openapi
 * /api/wallet/low-balance:
 *   get:
 *     tags: [Wallet]
 *     summary: List users with low balance (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: threshold, schema: { type: number } }
 *     responses:
 *       200:
 *         description: Low balance users
 */

/**
 * @openapi
 * /api/wallet/admin/adjust:
 *   post:
 *     tags: [Wallet]
 *     summary: Admin balance adjustment (positive or negative)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, amount]
 *             properties:
 *               user_id: { type: integer }
 *               amount: { type: number }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Balance adjusted
 */

// ─────────────────────────────── BLOGS ───────────────────────────────

/**
 * @openapi
 * /api/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: List published blog posts (public)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated blog posts
 *   post:
 *     tags: [Blogs]
 *     summary: Create blog post (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug, title]
 *             properties:
 *               slug: { type: string }
 *               title: { type: string }
 *               excerpt: { type: string }
 *               content: { type: string }
 *               category: { type: string }
 *               image: { type: string }
 *               author: { type: string }
 *               author_avatar: { type: string }
 *               read_time: { type: string }
 *               status: { type: string, enum: [draft, published] }
 *     responses:
 *       201:
 *         description: Blog post created
 */

/**
 * @openapi
 * /api/blogs/all:
 *   get:
 *     tags: [Blogs]
 *     summary: List all blog posts (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated all blog posts
 */

/**
 * @openapi
 * /api/blogs/{slug}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get blog post by slug
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Blog post
 */

/**
 * @openapi
 * /api/blogs/{id}:
 *   patch:
 *     tags: [Blogs]
 *     summary: Update blog post (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug: { type: string }
 *               title: { type: string }
 *               excerpt: { type: string }
 *               content: { type: string }
 *               category: { type: string }
 *               image: { type: string }
 *               author: { type: string }
 *               author_avatar: { type: string }
 *               read_time: { type: string }
 *               status: { type: string, enum: [draft, published] }
 *     responses:
 *       200:
 *         description: Blog post updated
 *   delete:
 *     tags: [Blogs]
 *     summary: Soft-delete blog post (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Blog post deleted
 */

// ─────────────────────────────── FAQS ───────────────────────────────

/**
 * @openapi
 * /api/faqs:
 *   get:
 *     tags: [FAQs]
 *     summary: List active FAQs (public, ordered)
 *     responses:
 *       200:
 *         description: FAQ list
 *   post:
 *     tags: [FAQs]
 *     summary: Create FAQ (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question: { type: string }
 *               answer: { type: string }
 *               category: { type: string, default: "General" }
 *               sort_order: { type: integer, default: 0 }
 *               active: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: FAQ created
 */

/**
 * @openapi
 * /api/faqs/all:
 *   get:
 *     tags: [FAQs]
 *     summary: List all FAQs (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: active, schema: { type: boolean } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated all FAQs
 */

/**
 * @openapi
 * /api/faqs/{id}:
 *   patch:
 *     tags: [FAQs]
 *     summary: Update FAQ (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question: { type: string }
 *               answer: { type: string }
 *               category: { type: string }
 *               sort_order: { type: integer }
 *               active: { type: boolean }
 *     responses:
 *       200:
 *         description: FAQ updated
 *   delete:
 *     tags: [FAQs]
 *     summary: Soft-delete FAQ (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: FAQ deleted
 */

// ─────────────────────────────── AUDIT ───────────────────────────────

/**
 * @openapi
 * /api/audit:
 *   get:
 *     tags: [Audit]
 *     summary: List audit log entries (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: actor_id, schema: { type: integer } }
 *       - { in: query, name: actor_type, schema: { type: string } }
 *       - { in: query, name: action, schema: { type: string } }
 *       - { in: query, name: entity, schema: { type: string } }
 *       - { in: query, name: date_from, schema: { type: string, format: date } }
 *       - { in: query, name: date_to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Paginated audit log
 */

// ─────────────────────────────── ACTIVITY ───────────────────────────────

/**
 * @openapi
 * /api/activity/log:
 *   post:
 *     tags: [Activity]
 *     summary: Log frontend activity event (authenticated)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, maxLength: 60 }
 *               action_details: { type: object }
 *               page_or_route: { type: string }
 *     responses:
 *       200:
 *         description: Activity logged
 */

/**
 * @openapi
 * /api/activity/mine:
 *   get:
 *     tags: [Activity]
 *     summary: Get own activity history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated activity
 */

// ─────────────────────────────── PACKAGES ───────────────────────────────

/**
 * @openapi
 * /api/packages:
 *   get:
 *     tags: [Packages]
 *     summary: List active subscription packages (public)
 *     responses:
 *       200:
 *         description: Package list
 *   post:
 *     tags: [Packages]
 *     summary: Create package (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number, minimum: 0 }
 *               duration_days: { type: integer }
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       201:
 *         description: Package created
 */

/**
 * @openapi
 * /api/packages/all:
 *   get:
 *     tags: [Packages]
 *     summary: List all packages (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: pageSize, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated packages
 */

/**
 * @openapi
 * /api/packages/{id}:
 *   patch:
 *     tags: [Packages]
 *     summary: Update package (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               duration_days: { type: integer }
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       200:
 *         description: Package updated
 *   delete:
 *     tags: [Packages]
 *     summary: Soft-delete package (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Package deleted
 */

// ─────────────────────────────── HEALTH ───────────────────────────────

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check with DB probe
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, enum: [ok, degraded] }
 *                 time: { type: string, format: date-time }
 */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Amoo Guru API",
      version: "1.0.0",
      description: "REST API for the Amoo Guru spiritual & astrology platform. Supports user auth, bookings, payments, chat, subscriptions, reports, and admin management.",
      contact: { name: "Amoo Support", email: "support@amoo.guru" },
    },
    servers: [
      { url: `http://localhost:${env.port || 3000}`, description: "Development" },
    ],
    tags: [
      { name: "Auth", description: "Authentication & account management" },
      { name: "Users", description: "User profile management (admin & self)" },
      { name: "Experts", description: "Expert management" },
      { name: "Services", description: "Service catalog" },
      { name: "Bookings", description: "Appointment bookings" },
      { name: "Payments", description: "Payment processing & gateway" },
      { name: "Slots", description: "Expert availability slots" },
      { name: "Subscriptions", description: "Subscription plans" },
      { name: "Coupons", description: "Discount coupons" },
      { name: "Chat", description: "Customer-expert messaging" },
      { name: "Notifications", description: "In-app & email notifications" },
      { name: "Testimonials", description: "Customer testimonials" },
      { name: "Contact", description: "Contact form enquiries" },
      { name: "Uploads", description: "File uploads & downloads" },
      { name: "Dashboard", description: "Admin dashboard analytics" },
      { name: "Reports", description: "Astrology report generation" },
      { name: "Wallet", description: "Wallet balance & transactions" },
      { name: "Blogs", description: "Blog articles" },
      { name: "FAQs", description: "Frequently asked questions" },
      { name: "Audit", description: "Admin audit log" },
      { name: "Activity", description: "User activity tracking" },
      { name: "Packages", description: "Subscription packages" },
      { name: "Health", description: "Service health check" },
    ],
  },
  apis: [__filename],
};

const spec = swaggerJsdoc(options);

function setupSwagger(app) {
  const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css";
  const swaggerPath = "/api/docs";
  const swaggerJsonPath = "/api/docs.json";
  app.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(spec, {
    customCssUrl: CSS_URL,
    customSiteTitle: "Amoo Guru API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  }));
  app.get(swaggerJsonPath, (req, res) => res.json(spec));
}

module.exports = { setupSwagger, spec };
