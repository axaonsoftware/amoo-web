/* eslint-disable @typescript-eslint/no-explicit-any */
// Use relative same-origin paths. In production nginx proxies /api/* to the
// backend directly; in local `next dev` the rewrite in next.config.ts forwards
// /api/* to the backend on localhost:4000. Either way requests stay
// same-origin so cookies (sameSite: lax) are sent.
const API_URL = "";
const REQUEST_TIMEOUT_MS = 30000;
const MAX_AUTH_RETRIES = 5;

type Headers = Record<string, string>;

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

interface RateLimitInfo {
  retryAfter: number;
  attempt: number;
}

type RateLimitHandler = (info: RateLimitInfo) => void;

let rateLimitHandler: RateLimitHandler | null = null;

export function setRateLimitHandler(handler: RateLimitHandler | null): void {
  rateLimitHandler = handler;
}

function exponentialBackoff(attempt: number): number {
  const base = Math.pow(2, attempt) * 1000;
  const jitter = Math.random() * 500;
  return base + jitter;
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = parseInt(header, 10);
  return isNaN(seconds) ? null : seconds * 1000;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const AUTH_ENDPOINTS = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/admin/login",
  "/api/auth/expert/login",
  "/api/auth/verify-email/send",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
]);

function isAuthEndpoint(path: string): boolean {
  return AUTH_ENDPOINTS.has(path.split("?")[0]);
}

// The API sets a `csrf_token` cookie and requires it echoed back in the
// X-CSRF-Token header on every state-changing request (double-submit). The
// browser sends the cookie on its own; we only have to supply the header.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfToken: string | null = null;

// document.cookie is origin-scoped, so when the API is on a different origin we
// can't read the cookie — the API also echoes the token in a CORS-exposed
// response header. Prefer the header, fall back to the cookie for same-origin
// or same-site local development.
function rememberCsrfToken(res: Response): void {
  const fromHeader = res.headers.get("X-CSRF-Token");
  if (fromHeader) csrfToken = fromHeader;
}

function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null; // SSR: no cookie jar
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// A mutating call can be the first request of the session, before any response
// has handed us a token. One cheap GET makes the API issue one.
// Deduplication: concurrent callers share the same in-flight promise.
let csrfPromise: Promise<string> | null = null;
async function ensureCsrfToken(): Promise<string> {
  // Fast path: token already cached from a previous response or cookie.
  const known = csrfToken || readCsrfCookie();
  if (known) return known;

  // Dedup: concurrent callers share the same fetch.
  if (csrfPromise) return csrfPromise;

  csrfPromise = (async () => {
    try {
      // First attempt.
      const res = await fetch(`${API_URL}/api/health`, {
        credentials: "include",
      });
      rememberCsrfToken(res);
      if (csrfToken) return csrfToken;

      // If the response didn't include the header, try the cookie.
      const cookie = readCsrfCookie();
      if (cookie) return cookie;

      // Retry once — the first fetch may have been a cold start where the
      // backend hadn't set the cookie yet.
      const retry = await fetch(`${API_URL}/api/health`, {
        credentials: "include",
      });
      rememberCsrfToken(retry);
      if (csrfToken) return csrfToken;
      const retryCookie = readCsrfCookie();
      if (retryCookie) return retryCookie;

      throw new Error(
        "Unable to initialize secure session. Please refresh and try again.",
      );
    } finally {
      csrfPromise = null;
    }
  })();

  return csrfPromise;
}

async function buildHeaders(
  method: string,
  base: Headers = {},
): Promise<Headers> {
  if (!MUTATING_METHODS.has(method.toUpperCase())) return base;
  const token = await ensureCsrfToken(); // throws on failure
  return { ...base, "X-CSRF-Token": token };
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: await buildHeaders("POST", {
          "Content-Type": "application/json",
        }),
        credentials: "include",
      });
      rememberCsrfToken(res);
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = new Error((data && data.error) || "Request failed");
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  if (data && data.success === true && data.data !== undefined) {
    if (data.meta) return { data: data.data, meta: data.meta };
    return data.data;
  }
  return data;
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const existingSignal = options.signal;
  if (existingSignal) {
    existingSignal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        controller.abort();
      },
      { once: true },
    );
  }
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function request(method: string, path: string, body?: unknown) {
  const isAuth = isAuthEndpoint(path);
  let rateLimitAttempt = 0;

  // Idempotency: generated once per logical request so the 401-refresh retry
  // below re-sends the SAME key. The backend dedupes on it (POST /api/bookings),
  // so a flaky refresh can never double-reserve a slot or double-insert.
  const isMutating = MUTATING_METHODS.has(method.toUpperCase());
  const idempotencyKey = isMutating ? crypto.randomUUID() : undefined;

  while (true) {
    const headers = await buildHeaders(
      method,
      idempotencyKey ? { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey } : { "Content-Type": "application/json" },
    );

    const res = await fetchWithTimeout(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    rememberCsrfToken(res);

    // Handle 429 rate limiting on auth endpoints
    if (res.status === 429 && isAuth && rateLimitAttempt < MAX_AUTH_RETRIES) {
      const retryAfterHeader = res.headers.get("Retry-After");
      const retryAfter = parseRetryAfter(retryAfterHeader);
      const waitMs = retryAfter ?? exponentialBackoff(rateLimitAttempt);

      if (rateLimitHandler) {
        rateLimitHandler({ retryAfter: waitMs, attempt: rateLimitAttempt });
      }

      await sleep(waitMs);
      rateLimitAttempt++;
      continue;
    }

    // /api/auth/me is expected to 401 for unauthenticated visitors — don't
    // redirect them to login just because they loaded a public page.
    if (
      res.status === 401 &&
      path !== "/api/auth/refresh" &&
      path !== "/api/auth/me"
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry budget: up to 2 attempts so a single flaky 401 after a successful
        // refresh doesn't immediately redirect the user to login.
        for (let attempt = 0; attempt < 2; attempt++) {
          const retryRes = await fetchWithTimeout(`${API_URL}${path}`, {
            method,
            headers: await buildHeaders(
              method,
              idempotencyKey ? { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey } : { "Content-Type": "application/json" },
            ),
            credentials: "include",
            body: body ? JSON.stringify(body) : undefined,
          });
          rememberCsrfToken(retryRes);
          if (retryRes.status === 401 && attempt === 0) {
            continue; // try once more
          }
          return handleResponse(retryRes);
        }
      }
      // Admin pages have their own login; sending an admin to /user-login would
      // log them into the wrong realm (the backend keeps admins in a separate
      // table and issues kind:"admin" tokens).
      // Only redirect when the current page is a protected route — public pages
      // (home, blog, services, etc.) should never redirect on 401.
      if (typeof window !== "undefined") {
        const { pathname } = window.location;
        const loginPaths = ["/user-login", "/admin-login", "/astrologer-login"];
        if (!loginPaths.includes(pathname)) {
          const isProtected =
            pathname.startsWith("/admin") ||
            pathname.startsWith("/user-dashboard") ||
            pathname.startsWith("/astrologer-dashboard") ||
            pathname === "/consultation/consultation-payment" ||
            pathname.startsWith("/consultation/consultation-payment/") ||
            pathname === "/consultation/booking-confirmation" ||
            pathname.startsWith("/consultation/booking-confirmation/") ||
            pathname === "/consultation/booking-summary" ||
            pathname.startsWith("/consultation/booking-summary/") ||
            pathname === "/consultation/consultation-booking" ||
            pathname.startsWith("/consultation/consultation-booking/");
          if (isProtected) {
            const loginPath = pathname.startsWith("/admin")
              ? "/admin-login"
              : pathname.startsWith("/astrologer-dashboard")
                ? "/astrologer-login"
                : "/user-login";
            window.location.href = loginPath;
          }
        }
      }
    }

    return handleResponse(res);
  }
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Routes that call the backend's `paginated()` helper resolve to
 * `{ data, meta }`; routes that call `ok()` with an array resolve to the bare
 * array. Callers should not have to know which is which — several components
 * called `.filter()` straight on the envelope and crashed.
 */
export function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const inner = (res as { data?: unknown } | null)?.data;
  return Array.isArray(inner) ? (inner as T[]) : [];
}

/** Pagination meta from a paginated response, or null if unpaginated. */
export function unwrapMeta(res: unknown): PageMeta | null {
  const meta = (res as { meta?: PageMeta } | null)?.meta;
  return meta && typeof meta.total === "number" ? meta : null;
}

/** Build a query string from a filter object, dropping empty values. */
export function qs(
  params: Record<string, string | number | undefined | null>,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // auth
  register: (body: unknown) => request("POST", "/api/auth/register", body),
  login: (body: unknown) => request("POST", "/api/auth/login", body),
  adminLogin: (body: unknown) => request("POST", "/api/auth/admin/login", body),
  expertLogin: (body: unknown) =>
    request("POST", "/api/auth/expert/login", body),
  me: () => request("GET", "/api/auth/me"),
  logout: () => request("POST", "/api/auth/logout"),
  verifyEmailSend: () => request("POST", "/api/auth/verify-email/send"),
  verifyEmail: (body: { email: string; token: string }) =>
    request("POST", "/api/auth/verify-email", body),
  forgotPassword: (body: { email: string }) =>
    request("POST", "/api/auth/forgot-password", body),
  resetPassword: (body: { email: string; otp: string; password: string }) =>
    request("POST", "/api/auth/reset-password", body),

  // admin-scoped requests
  admin: {
    getServices: () => request("GET", "/api/services/all"),
    createService: (body: unknown) => request("POST", "/api/services", body),
    updateService: (id: number, body: unknown) =>
      request("PATCH", `/api/services/${id}`, body),
    deleteService: (id: number) => request("DELETE", `/api/services/${id}`),
    getServicePricing: (id: number) =>
      request("GET", `/api/services/${id}/pricing`),
    setServicePricing: (id: number, body: unknown) =>
      request("POST", `/api/services/${id}/pricing`, body),
    deleteServicePricing: (serviceId: number, expertId: number) =>
      request("DELETE", `/api/services/${serviceId}/pricing/${expertId}`),

    getUsers: (query = "") => request("GET", `/api/users${query}`),
    getUser: (id: number) => request("GET", `/api/users/${id}`),
    updateUser: (id: number, body: unknown) =>
      request("PATCH", `/api/users/${id}`, body),
    deleteUser: (id: number) => request("DELETE", `/api/users/${id}`),

    getBookings: (query = "") => request("GET", `/api/bookings${query}`),
    getBooking: (id: number) => request("GET", `/api/bookings/${id}`),
    updateBooking: (id: number, body: unknown) =>
      request("PATCH", `/api/bookings/${id}`, body),
    completeBooking: (id: number) =>
      request("POST", `/api/bookings/${id}/complete`),
    addAttachment: (id: number, uploadId: number) =>
      request("POST", `/api/bookings/${id}/attachment`, { upload_id: uploadId }),
    cancelBooking: (id: number) => request("DELETE", `/api/bookings/${id}`),

    getPackages: () => request("GET", "/api/packages/all"),
    createPackage: (body: unknown) => request("POST", "/api/packages", body),
    updatePackage: (id: number, body: unknown) =>
      request("PATCH", `/api/packages/${id}`, body),
    deletePackage: (id: number) => request("DELETE", `/api/packages/${id}`),

    getReports: (query = "") => request("GET", `/api/reports${query}`),
    getReport: (id: number) => request("GET", `/api/reports/${id}`),
    createReport: (body: unknown) =>
      request("POST", "/api/reports/admin", body),
    updateReport: (id: number, body: unknown) =>
      request("PATCH", `/api/reports/${id}`, body),
    deleteReport: (id: number) => request("DELETE", `/api/reports/${id}`),

    getPayments: (query = "") => request("GET", `/api/payments${query}`),
    refundPayment: (id: number, body: unknown) =>
      request("POST", `/api/payments/${id}/refund`, body),
    getPaymentRefunds: (query = "") =>
      request("GET", `/api/payments/refunds${query}`),
    getPaymentStats: () => request("GET", "/api/payments/stats/overview"),

    getCoupons: (query = "") => request("GET", `/api/coupons${query}`),
    createCoupon: (body: unknown) => request("POST", "/api/coupons", body),
    updateCoupon: (id: number, body: unknown) =>
      request("PATCH", `/api/coupons/${id}`, body),
    deleteCoupon: (id: number) => request("DELETE", `/api/coupons/${id}`),

    getSlots: (query = "") => request("GET", `/api/slots${query}`),
    // Per-expert aggregates for the availability table. /api/slots returns
    // individual slot rows, which that table cannot render without inventing
    // the totals — which is exactly what it used to do.
    getSlotAvailability: (query = "") =>
      request("GET", `/api/slots/availability${query}`),
    createSlot: (body: unknown) => request("POST", "/api/slots", body),
    updateSlot: (id: number, body: unknown) =>
      request("PATCH", `/api/slots/${id}`, body),
    deleteSlot: (id: number) => request("DELETE", `/api/slots/${id}`),
    reserveSlot: (slotId: number) =>
      request("PATCH", `/api/slots/${slotId}`, { status: "booked" }),

    getContacts: (query = "") => request("GET", `/api/contact${query}`),
    getContact: (id: number) => request("GET", `/api/contact/${id}`),
    updateContact: (id: number, body: unknown) =>
      request("PATCH", `/api/contact/${id}`, body),
    deleteContact: (id: number) => request("DELETE", `/api/contact/${id}`),

    getSubscriptions: () => request("GET", "/api/subscriptions/all"),
    updateSubscription: (id: number, body: unknown) =>
      request("PATCH", `/api/subscriptions/${id}`, body),

    getTestimonials: (query = "") =>
      request("GET", `/api/testimonials/all${query}`),
    updateTestimonial: (id: number, body: unknown) =>
      request("PATCH", `/api/testimonials/${id}`, body),
    deleteTestimonial: (id: number) =>
      request("DELETE", `/api/testimonials/${id}`),

    getNotifications: (query = "") =>
      request("GET", `/api/notifications/all${query}`),
    createNotification: (body: unknown) =>
      request("POST", "/api/notifications", body),
    deleteNotification: (id: number) =>
      request("DELETE", `/api/notifications/${id}`),

    getUploads: () => request("GET", "/api/uploads/all"),

    getExperts: (query = "") => request("GET", `/api/experts${query}`),
    createExpert: (body: unknown) => request("POST", "/api/experts", body),
    updateExpert: (id: number, body: unknown) =>
      request("PATCH", `/api/experts/${id}`, body),
    deleteExpert: (id: number) => request("DELETE", `/api/experts/${id}`),
    // Experts have no self-service signup or password reset: an admin sets the
    // credential here, which also marks them verified. Without a UI for this,
    // /astrologer-login existed but no expert could ever obtain a password.
    setExpertPassword: (id: number, password: string) =>
      request("POST", `/api/experts/${id}/set-password`, { password }),
    getExpertEarnings: (id: number) =>
      request("GET", `/api/experts/${id}/earnings`),
    getExpertBookings: (id: number, query = "") =>
      request("GET", `/api/experts/${id}/bookings${query}`),
    getExpertAvailability: (id: number) =>
      request("GET", `/api/experts/${id}/availability`),

    getSettings: () => request("GET", "/api/settings"),
    updateSettings: (body: Record<string, string>) =>
      request("PUT", "/api/settings", body),

    getHoroscopes: (query = "") =>
      request("GET", `/api/content/horoscopes${query}`),
    createHoroscope: (body: unknown) =>
      request("POST", "/api/content/horoscopes", body),
    updateHoroscope: (id: number, body: unknown) =>
      request("PUT", `/api/content/horoscopes/${id}`, body),
    deleteHoroscope: (id: number) =>
      request("DELETE", `/api/content/horoscopes/${id}`),
    getZodiacSigns: () => request("GET", "/api/content/zodiac-signs/all"),
    updateZodiacSign: (id: number, body: unknown) =>
      request("PUT", `/api/content/zodiac-signs/${id}`, body),

    getUserWallet: (id: number) =>
      request("GET", `/api/users/${id}/wallet`),
    creditUser: (id: number, body: { amount: number; reason?: string }) =>
      request("POST", `/api/users/${id}/credit`, body),

    createManualBooking: (body: unknown) =>
      request("POST", "/api/bookings/manual", body),


    getOverview: () => request("GET", "/api/dashboard/overview"),
    getTopExperts: (limit = 5) =>
      request("GET", `/api/dashboard/experts/top?limit=${limit}`),
    getAudit: (query = "") => request("GET", `/api/audit${query}`),

    getBlogs: (query = "") => request("GET", `/api/blogs/all${query}`),
    createBlog: (body: unknown) => request("POST", "/api/blogs", body),
    updateBlog: (id: number, body: unknown) =>
      request("PATCH", `/api/blogs/${id}`, body),
    deleteBlog: (id: number) => request("DELETE", `/api/blogs/${id}`),

    getFaqs: () => request("GET", "/api/faqs/all"),
    createFaq: (body: unknown) => request("POST", "/api/faqs", body),
    updateFaq: (id: number, body: unknown) =>
      request("PATCH", `/api/faqs/${id}`, body),
    deleteFaq: (id: number) => request("DELETE", `/api/faqs/${id}`),

    getBookingsTrends: (period = "month") =>
      request("GET", `/api/dashboard/bookings/trends?period=${period}`),
    getRevenue: (period = "month") =>
      request("GET", `/api/dashboard/revenue?period=${period}`),
    getUsersGrowth: (period = "month") =>
      request("GET", `/api/dashboard/users/growth?period=${period}`),
    getRevenueByService: (query = "") =>
      request("GET", `/api/dashboard/revenue/by-service${query}`),
    getReportsByType: () => request("GET", "/api/dashboard/reports/by-type"),
    getBookingPatterns: () =>
      request("GET", "/api/dashboard/bookings/patterns"),

    exportCSV: async (type: string) => {
      const csrf = await ensureCsrfToken();
      const headers: Headers = { "X-CSRF-Token": csrf };
      const res = await fetchWithTimeout(
        `${API_URL}/api/dashboard/export/${type}`,
        {
          credentials: "include",
          headers,
        },
        60000,
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  },

  // public reads
  getServices: (query = "") => request("GET", `/api/services${query}`),
  getService: (id: number) => request("GET", `/api/services/${id}`),
  getExperts: () => request("GET", "/api/experts"),
  getTestimonials: () => request("GET", "/api/testimonials"),
  getPackages: () => request("GET", "/api/packages"),
  getSlots: (query = "") => request("GET", `/api/slots${query}`),
  updateSlot: (id: number, body: unknown) =>
    request("PATCH", `/api/slots/${id}`, body),
  reserveSlot: (slotId: number) =>
    request("PATCH", `/api/slots/${slotId}`, { status: "booked" }),

  // blogs (public)
  getBlogs: (query = "") => request("GET", `/api/blogs${query}`),
  getBlogPost: (slug: string) => request("GET", `/api/blogs/${slug}`),

  // faqs (public)
  getFaqs: () => request("GET", "/api/faqs"),

  // user (auth)
  getProfile: () => request("GET", "/api/users/me"),
  updateProfile: (body: unknown) => request("PATCH", "/api/users/me", body),

  getBookings: () => request("GET", "/api/bookings"),
  createBooking: (body: unknown) => request("POST", "/api/bookings", body),
  getReports: () => request("GET", "/api/reports"),
  getReport: (id: number) => request("GET", `/api/reports/${id}`),
  getReportStats: () => request("GET", "/api/reports/stats"),
  createReport: (body: unknown) => request("POST", "/api/reports", body),

  getWallet: () => request("GET", "/api/wallet"),
  getSubscriptions: () => request("GET", "/api/subscriptions"),
  subscribe: (body: unknown) => request("POST", "/api/subscriptions", body),
  getNotifications: (query = "") =>
    request("GET", `/api/notifications${query}`),
  getUnreadCount: () => request("GET", "/api/notifications/unread-count"),
  markRead: (id: number) => request("POST", `/api/notifications/${id}/read`),
  markAllRead: () => request("POST", "/api/notifications/read-all"),

  // contact (public)
  sendContact: (body: unknown) => request("POST", "/api/contact", body),

  // chat - all endpoints automatically include the CSRF token header
  // because they use POST/GET (the api helper handles this for all mutating methods).
  // csrfToken is fetched on first call via ensureCsrfToken().
  chat: {
    getConversations: (query = "") =>
      request("GET", `/api/chat/conversations${query}`),
    openConversation: (participantId: number) =>
      request("POST", "/api/chat/conversations", {
        participant_id: participantId,
      }),
    getMessages: (convId: number, query = "") =>
      request("GET", `/api/chat/conversations/${convId}/messages${query}`),
    sendMessage: (convId: number, content: string, clientId?: string) =>
      request("POST", `/api/chat/conversations/${convId}/messages`, {
        content,
        ...(clientId ? { client_id: clientId } : {}),
      }),
    markRead: (convId: number) =>
      request("POST", `/api/chat/conversations/${convId}/read`),
    getUnreadCount: () => request("GET", "/api/chat/unread-count"),
  },

  // payment
  createPaymentOrder: (body: unknown) =>
    request("POST", "/api/payments/create-order", body),
  verifyPayment: (body: unknown) =>
    request("POST", "/api/payments/verify", body),

  // coupons
  //
  // `validate` is a dry run used to preview a discount before a booking exists.
  // It MUST be sent the order amount: the backend computes
  //   discount = amount ? (percent ? amount * value / 100 : value) : 0
  // so omitting `amount` made every preview return 0 and the UI cheerfully
  // reported "You saved ₹0".
  validateCoupon: (code: string, amount?: number) =>
    request("POST", "/api/coupons/validate", {
      code,
      ...(amount != null ? { amount } : {}),
    }),

  // `apply` is the real redemption: it is transactional, idempotent per booking
  // (UNIQUE key on coupon_usages.booking_id), and writes the discounted total
  // back to bookings.amount so the customer is actually charged less. Nothing
  // called it before, which is why coupons never reduced anyone's bill.
  applyCoupon: (code: string, bookingId: number) =>
    request("POST", "/api/coupons/apply", { code, booking_id: bookingId }),

  getAgoraToken: (bookingId: number) =>
    request("POST", "/api/agora/token", {
      booking_id: bookingId,
    }),

  // activity tracking
  getMyActivity: (query = "") => request("GET", `/api/activity/mine${query}`),
  logActivity: (body: {
    action: string;
    action_details?: any;
    entity?: string;
    entity_id?: number;
    page_or_route?: string;
  }) => request("POST", "/api/activity/log", body),

  // upload (auth)
  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    let res = await fetchWithTimeout(
      `${API_URL}/api/uploads`,
      {
        method: "POST",
        headers: await buildHeaders("POST"),
        credentials: "include",
        body: form,
      },
      120000,
    );
    rememberCsrfToken(res);

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        res = await fetchWithTimeout(
          `${API_URL}/api/uploads`,
          {
            method: "POST",
            headers: await buildHeaders("POST"),
            credentials: "include",
            body: form,
          },
          120000,
        );
        rememberCsrfToken(res);
      }
      if (!res.ok && typeof window !== "undefined") {
        const { pathname } = window.location;
        const isProtected =
          pathname.startsWith("/user-dashboard") ||
          pathname === "/consultation/consultation-booking" ||
          pathname.startsWith("/consultation/consultation-booking/") ||
          pathname === "/consultation/consultation-payment" ||
          pathname.startsWith("/consultation/consultation-payment/");
        if (isProtected) {
          window.location.href = "/user-login";
          throw new Error("Session expired. Redirecting to login…");
        }
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && data.error) || "Upload failed");
    return data;
  },
};

export default api;
