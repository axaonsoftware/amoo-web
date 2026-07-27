/**
 * Shapes returned by the Express API.
 *
 * These mirror the actual SELECT lists and column types in `amoo-backend/src`,
 * not a guess — each block notes the route and table it comes from. They exist
 * because ~95 components typed API rows as `any`, which meant a field renamed
 * or dropped on the backend produced `undefined` at runtime with no build-time
 * signal. Several of the integration bugs found in the Phase 1 audit
 * (`total_slots` that no endpoint returns, `service_name` on payments, a
 * `savings` field that is really `discount`) would have been caught here.
 *
 * CONVENTIONS
 * - DECIMAL columns arrive as **strings** ("999.00"), so money is typed
 *   `number | string` and must go through `toNumber`/`formatCurrency`
 *   from `lib/format.ts` before arithmetic.
 * - DATE/DATETIME arrive as ISO strings (from JSON-serialised Date objects).
 * - BOOLEAN columns (mapped from PostgreSQL BOOLEAN) arrive as true/false.
 */

/** DECIMAL — always normalise with `toNumber()` before doing maths. */
export type Decimal = number | string;

/** PostgreSQL BOOLEAN. Truthy check is safe; `=== true` is not. */
export type Flag = boolean;

/** ISO date or datetime string. */
export type DateString = string;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

/** `USER_SELECT` in routes/users.js, and `publicUser()` in routes/auth.js. */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "free" | "premium" | "consultant";
  status: "active" | "blocked" | "pending";
  verified: Flag;
  dob?: DateString | null;
  tob?: string | null;
  birthplace?: string | null;
  gender?: string | null;
  language?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  created_at: DateString;
}

/** `EXPERT_SELECT` in routes/experts.js. */
export interface Expert {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role_title: string | null;
  bio?: string | null;
  specialties: string | null;
  rating: Decimal | null;
  status: "active" | "inactive";
  created_at: DateString;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export type ServiceCategory =
  | "Numerology" | "Tarot" | "Astrology" | "Healing" | "Vastu" | "AI Services" | "Spiritual";

/** `services` table. */
export interface Service {
  id: number;
  name: string;
  sub: string | null;
  img: string | null;
  category: ServiceCategory;
  type: "Report" | "Consultation" | "Chat";
  price: Decimal;
  duration: string | null;
  status: "Active" | "Inactive";
  bookings: number;
  created_at: DateString;
}

/** `packages` table. */
export interface Package {
  id: number;
  name: string;
  description: string | null;
  price: Decimal;
  duration_days: number | null;
  status: "Active" | "Inactive";
  created_at: DateString;
}

// ---------------------------------------------------------------------------
// Booking & scheduling
// ---------------------------------------------------------------------------

export type BookingStatus = "upcoming" | "completed" | "cancelled" | "pending-payment";

/**
 * `LIST_SELECT` in routes/bookings.js — `bookings.*` plus three joined names.
 * `user_name`/`service_name` come from INNER JOINs; `expert_name` is a LEFT
 * JOIN and is null for unassigned bookings.
 */
export interface Booking {
  id: number;
  booking_ref: string;
  user_id: number;
  expert_id: number | null;
  service_id: number;
  slot_id: number | null;
  date: DateString;
  time: string;
  mode: string | null;
  amount: Decimal;
  payment: "Paid" | "Pending";
  status: BookingStatus;
  notes: string | null;
  created_at: DateString;
  user_name?: string;
  expert_name?: string | null;
  service_name?: string;
}

/** `slots` table — one row per bookable slot. NOT a per-expert aggregate. */
export interface Slot {
  id: number;
  expert_id: number;
  date: DateString;
  start_time: string;
  end_time: string | null;
  status: "available" | "booked" | "blocked";
}

/**
 * `GET /api/slots/availability` — per-expert aggregate.
 *
 * Distinct from `Slot` on purpose: the admin availability table used to read
 * `total_slots`/`booked_slots` off plain `Slot` rows, where those fields have
 * never existed, and silently substituted invented numbers.
 */
export interface ExpertAvailability {
  id: number;
  name: string;
  avatar: string | null;
  specialties: string | null;
  status: "active" | "inactive";
  rating: Decimal | null;
  total_slots: number;
  booked_slots: number;
  available_slots: number;
  blocked_slots: number;
  first_slot_date: DateString | null;
  last_slot_date: DateString | null;
  utilisation_pct: number;
}

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

export type PaymentStatus = "success" | "pending" | "failed" | "refunded";

/** `payments` table. NOTE: there is no `service_name` column — join via booking. */
export interface Payment {
  id: number;
  booking_id: number | null;
  subscription_id: number | null;
  user_id: number | null;
  amount: Decimal;
  method: string | null;
  gateway: string | null;
  status: PaymentStatus;
  txn_id: string | null;
  gateway_order_id: string | null;
  refund_id?: string | null;
  refunded_at?: DateString | null;
  created_at: DateString;
}

/** `GET /api/payments/stats/overview`. */
export interface PaymentStats {
  total: number;
  total_revenue: Decimal;
  collected: Decimal;
  pending: Decimal;
  refunded: Decimal;
  failed: Decimal;
  success_count: number;
  pending_count: number;
  refunded_count: number;
  failed_count: number;
  refunds: number;
  refunded_amount: number;
  by_method: { method: string | null; count: number; amount: Decimal }[];
}

export interface Refund {
  id: number;
  payment_id: number;
  user_id: number | null;
  amount: Decimal;
  reason: string | null;
  status: "pending" | "processed" | "failed";
  created_at: DateString;
  txn_id?: string | null;
  method?: string | null;
}

/** `coupons` table. */
export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "flat";
  discount_value: Decimal;
  min_amount: Decimal;
  max_uses: number | null;
  used_count: number;
  expires_at: DateString | null;
  active: Flag;
  created_at: DateString;
}

/**
 * `POST /api/coupons/validate`.
 * The field is `discount` — a component reading `savings` gets undefined.
 */
export interface CouponValidation {
  coupon: Coupon;
  discount: number;
  amount: number;
}

/** `subscriptions` joined with `packages` in routes/subscriptions.js. */
export interface Subscription {
  id: number;
  user_id: number;
  package_id: number | null;
  plan_name: string | null;
  status: "active" | "expired" | "cancelled" | "pending-payment";
  auto_renew: Flag;
  started_at: DateString;
  expires_at: DateString | null;
  package_name?: string | null;
  package_price?: Decimal | null;
  user_name?: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  meta?: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  amount: Decimal;
  type: "credit" | "debit";
  reason: string | null;
  ref: string | null;
  created_at: DateString;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

/** `reports` table. `chakra_data` is a JSON column (reiki reports only). */
export interface Report {
  id: number;
  user_id: number;
  service_id: number | null;
  type: string | null;
  title: string | null;
  content: string | null;
  file_url: string | null;
  status: "pending" | "ready" | "rejected";
  is_favorite: Flag;
  downloaded: Flag;
  chakra_data: unknown | null;
  created_at: DateString;
}

export interface Blog {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string | null;
  category: string | null;
  image: string | null;
  author: string | null;
  author_avatar: string | null;
  read_time: string | null;
  views: number;
  status: "draft" | "published";
  created_at: DateString;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  active: Flag;
}

export interface Testimonial {
  id: number;
  user_id: number | null;
  name: string | null;
  avatar: string | null;
  comment: string;
  rating: number;
  status: "Active" | "Inactive";
  created_at: DateString;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  reply: string | null;
  status: "new" | "replied" | "closed";
  created_at: DateString;
}

export interface Notification {
  id: number;
  user_id: number | null;
  title: string;
  message: string | null;
  type: string;
  is_read: Flag;
  created_at: DateString;
}

export interface ActivityEntry {
  id: number;
  action: string;
  action_details: Record<string, unknown> | null;
  page_or_route: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  actor_id?: number | null;
  actor_type?: string | null;
  entity?: string | null;
  entity_id?: number | null;
  created_at: DateString;
}

// ---------------------------------------------------------------------------
// Dashboard aggregates (routes/dashboard.js)
// ---------------------------------------------------------------------------

/** `GET /api/dashboard/overview`. */
export interface DashboardOverview {
  stats: {
    users: number;
    experts: number;
    services: number;
    bookings: number;
    revenue: number;
    pendingPayments: number;
    todayBookings: number;
  };
  topServices: { id: number; name: string; bookings: number; price: Decimal }[];
  recent: {
    booking_ref: string;
    user_name: string;
    service_name: string;
    amount: Decimal;
    status: BookingStatus;
    date: DateString;
  }[];
}

/** `GET /api/dashboard/revenue` — one row per period bucket. */
export interface RevenuePoint {
  label: string;
  payments: number;
  revenue: Decimal;
}

export interface BookingTrendPoint {
  label: string;
  count: number;
  cancelled: number;
}

export interface UserGrowthPoint {
  label: string;
  new_users: number;
}

export interface RevenueByService {
  id: number;
  name: string;
  payments: number;
  revenue: Decimal;
}

export interface ReportsByType {
  type: string;
  total: number;
  ready: number;
  pending: number;
}

export interface TopExpert {
  id: number;
  name: string;
  avatar: string | null;
  rating: Decimal | null;
  bookings: number;
  completed: number;
  revenue: Decimal;
  clients: number;
}

/** `GET /api/dashboard/bookings/patterns`. DAYOFWEEK(): 1=Sunday .. 7=Saturday. */
export interface BookingPatterns {
  total: number;
  peakDay: { day: number; count: number } | null;
  peakHour: { hour: number; count: number } | null;
  byDay: { day: number; count: number }[];
  byHour: { hour: number; count: number }[];
}

/** `GET /api/users/stats`. */
export interface UserStats {
  total: number;
  active: Flag;
  premium: number;
  today: number;
  byRole: { role: string; count: number }[];
}
