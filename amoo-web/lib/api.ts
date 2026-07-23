const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Headers = Record<string, string>;

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function handleResponse(res: Response): Promise<any> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = new Error((data && (data as any).error) || "Request failed");
    err.status = res.status;
    err.details = (data as any).details;
    throw err;
  }
  if (data && data.success === true && data.data !== undefined) {
    if (data.meta) return { data: data.data, meta: data.meta };
    return data.data;
  }
  return data;
}

async function request(method: string, path: string, body?: unknown): Promise<any> {
  const headers: Headers = { "Content-Type": "application/json" };

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && path !== "/api/auth/refresh") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryRes = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse(retryRes);
    }
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/user-login")) {
      window.location.href = "/user-login";
    }
  }

  return handleResponse(res);
}

export const api = {
  // auth
  register: (body: unknown) => request("POST", "/api/auth/register", body),
  login: (body: unknown) => request("POST", "/api/auth/login", body),
  adminLogin: (body: unknown) => request("POST", "/api/auth/admin/login", body),
  me: () => request("GET", "/api/auth/me"),
  logout: () => request("POST", "/api/auth/logout"),
  verifyEmailSend: () => request("POST", "/api/auth/verify-email/send", null, true),
  verifyEmail: (body: { email: string; token: string }) => request("POST", "/api/auth/verify-email", body),

  // admin-scoped requests
  admin: {
    getServices: () => request("GET", "/api/services/all"),
    createService: (body: unknown) => request("POST", "/api/services", body),
    updateService: (id: number, body: unknown) => request("PATCH", `/api/services/${id}`, body),
    deleteService: (id: number) => request("DELETE", `/api/services/${id}`),

    getUsers: (query = "") => request("GET", `/api/users${query}`),
    getUser: (id: number) => request("GET", `/api/users/${id}`),
    updateUser: (id: number, body: unknown) => request("PATCH", `/api/users/${id}`, body),
    deleteUser: (id: number) => request("DELETE", `/api/users/${id}`),

    getBookings: (query = "") => request("GET", `/api/bookings${query}`),
    getBooking: (id: number) => request("GET", `/api/bookings/${id}`),
    updateBooking: (id: number, body: unknown) => request("PATCH", `/api/bookings/${id}`, body),
    completeBooking: (id: number) => request("POST", `/api/bookings/${id}/complete`),
    cancelBooking: (id: number) => request("DELETE", `/api/bookings/${id}`),

    getPackages: () => request("GET", "/api/packages/all"),
    createPackage: (body: unknown) => request("POST", "/api/packages", body),
    updatePackage: (id: number, body: unknown) => request("PATCH", `/api/packages/${id}`, body),
    deletePackage: (id: number) => request("DELETE", `/api/packages/${id}`),

    getReports: (query = "") => request("GET", `/api/reports${query}`),
    getReport: (id: number) => request("GET", `/api/reports/${id}`),
    createReport: (body: unknown) => request("POST", "/api/reports/admin", body),
    updateReport: (id: number, body: unknown) => request("PATCH", `/api/reports/${id}`, body),
    deleteReport: (id: number) => request("DELETE", `/api/reports/${id}`),

    getPayments: () => request("GET", "/api/payments"),
    refundPayment: (id: number, body: unknown) => request("POST", `/api/payments/${id}/refund`, body),
    getPaymentRefunds: (query = "") => request("GET", `/api/payments/refunds${query}`),
    getPaymentStats: () => request("GET", "/api/payments/stats/overview"),

    getCoupons: () => request("GET", "/api/coupons"),
    createCoupon: (body: unknown) => request("POST", "/api/coupons", body),
    updateCoupon: (id: number, body: unknown) => request("PATCH", `/api/coupons/${id}`, body),
    deleteCoupon: (id: number) => request("DELETE", `/api/coupons/${id}`),

    getSlots: (query = "") => request("GET", `/api/slots${query}`),
    createSlot: (body: unknown) => request("POST", "/api/slots", body),
    updateSlot: (id: number, body: unknown) => request("PATCH", `/api/slots/${id}`, body),
    deleteSlot: (id: number) => request("DELETE", `/api/slots/${id}`),

    getContacts: () => request("GET", "/api/contact"),
    getContact: (id: number) => request("GET", `/api/contact/${id}`),
    updateContact: (id: number, body: unknown) => request("PATCH", `/api/contact/${id}`, body),
    deleteContact: (id: number) => request("DELETE", `/api/contact/${id}`),

    getSubscriptions: () => request("GET", "/api/subscriptions/all"),
    updateSubscription: (id: number, body: unknown) => request("PATCH", `/api/subscriptions/${id}`, body),

    getTestimonials: () => request("GET", "/api/testimonials/all"),
    updateTestimonial: (id: number, body: unknown) => request("PATCH", `/api/testimonials/${id}`, body),
    deleteTestimonial: (id: number) => request("DELETE", `/api/testimonials/${id}`),

    getNotifications: (query = "") => request("GET", `/api/notifications/all${query}`),
    createNotification: (body: unknown) => request("POST", "/api/notifications", body),
    deleteNotification: (id: number) => request("DELETE", `/api/notifications/${id}`),

    getUploads: () => request("GET", "/api/uploads/all"),

    getExperts: (query = "") => request("GET", `/api/experts${query}`),
    createExpert: (body: unknown) => request("POST", "/api/experts", body),
    updateExpert: (id: number, body: unknown) => request("PATCH", `/api/experts/${id}`, body),
    deleteExpert: (id: number) => request("DELETE", `/api/experts/${id}`),

    getOverview: () => request("GET", "/api/dashboard/overview"),
    getTopExperts: (limit = 5) =>
      request("GET", `/api/dashboard/experts/top?limit=${limit}`),
    getAudit: (query = "") =>
      request("GET", `/api/audit${query}`),

    getBlogs: (query = "") => request("GET", `/api/blogs/all${query}`),
    createBlog: (body: unknown) => request("POST", "/api/blogs", body),
    updateBlog: (id: number, body: unknown) => request("PATCH", `/api/blogs/${id}`, body),
    deleteBlog: (id: number) => request("DELETE", `/api/blogs/${id}`),

    getFaqs: () => request("GET", "/api/faqs/all"),
    createFaq: (body: unknown) => request("POST", "/api/faqs", body),
    updateFaq: (id: number, body: unknown) => request("PATCH", `/api/faqs/${id}`, body),
    deleteFaq: (id: number) => request("DELETE", `/api/faqs/${id}`),

    getBookingsTrends: (period = "month") =>
      request("GET", `/api/dashboard/bookings/trends?period=${period}`),
    getRevenue: (period = "month") =>
      request("GET", `/api/dashboard/revenue?period=${period}`),
    getUsersGrowth: (period = "month") =>
      request("GET", `/api/dashboard/users/growth?period=${period}`),

    exportCSV: async (type: string) => {
      const res = await fetch(`${API_URL}/api/dashboard/export/${type}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
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
  getServices: () => request("GET", "/api/services"),
  getService: (id: number) => request("GET", `/api/services/${id}`),
  getExperts: () => request("GET", "/api/experts"),
  getTestimonials: () => request("GET", "/api/testimonials"),
  getPackages: () => request("GET", "/api/packages"),
  getSlots: (query = "") => request("GET", `/api/slots${query}`),

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
  getReportStats: () => request("GET", "/api/reports/stats"),
  getWallet: () => request("GET", "/api/wallet"),
  getSubscriptions: () => request("GET", "/api/subscriptions"),
  subscribe: (body: unknown) => request("POST", "/api/subscriptions", body),
  getNotifications: (query = "") => request("GET", `/api/notifications${query}`),
  getUnreadCount: () => request("GET", "/api/notifications/unread-count"),
  markRead: (id: number) => request("POST", `/api/notifications/${id}/read`),
  markAllRead: () => request("POST", "/api/notifications/read-all"),

  // contact (public)
  sendContact: (body: unknown) => request("POST", "/api/contact", body),

  // payment
  createPaymentOrder: (body: unknown) => request("POST", "/api/payments/create-order", body),
  verifyPayment: (body: unknown) => request("POST", "/api/payments/verify", body),

  // coupons (public)
  validateCoupon: (code: string) => request("POST", "/api/coupons/validate", { code }),

  // activity tracking
  getMyActivity: (query = "") => request("GET", `/api/activity/mine${query}`),

  // upload (auth)
  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && (data as any).error) || "Upload failed");
    return data;
  },
};

export default api;
