// Central API client for the Amoo Guru frontend.
// Point NEXT_PUBLIC_API_URL at your backend (default http://localhost:4000).

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Headers = Record<string, string>;

function authHeader(tokenKey = "amoo_token"): Headers {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(tokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

async function request(method: string, path: string, body?: unknown, withAuth = false, tokenKey = "amoo_token"): Promise<any> {
  const headers: Headers = { "Content-Type": "application/json", ...(withAuth ? authHeader(tokenKey) : {}) };
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
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

export const api = {
  // auth
  register: (body: unknown) => request("POST", "/api/auth/register", body),
  login: (body: unknown) => request("POST", "/api/auth/login", body),
  adminLogin: (body: unknown) => request("POST", "/api/auth/admin/login", body),
  me: () => request("GET", "/api/auth/me", null, true),

  // admin-scoped requests (uses amoo_admin_token)
  admin: {
    getServices: () => request("GET", "/api/services/all", null, true, "amoo_admin_token"),
    createService: (body: unknown) => request("POST", "/api/services", body, true, "amoo_admin_token"),
    updateService: (id: number, body: unknown) => request("PATCH", `/api/services/${id}`, body, true, "amoo_admin_token"),
    deleteService: (id: number) => request("DELETE", `/api/services/${id}`, null, true, "amoo_admin_token"),

    getUsers: (query = "") => request("GET", `/api/users${query}`, null, true, "amoo_admin_token"),
    getUser: (id: number) => request("GET", `/api/users/${id}`, null, true, "amoo_admin_token"),
    updateUser: (id: number, body: unknown) => request("PATCH", `/api/users/${id}`, body, true, "amoo_admin_token"),
    deleteUser: (id: number) => request("DELETE", `/api/users/${id}`, null, true, "amoo_admin_token"),

    getBookings: (query = "") => request("GET", `/api/bookings${query}`, null, true, "amoo_admin_token"),
    getBooking: (id: number) => request("GET", `/api/bookings/${id}`, null, true, "amoo_admin_token"),
    updateBooking: (id: number, body: unknown) => request("PATCH", `/api/bookings/${id}`, body, true, "amoo_admin_token"),
    completeBooking: (id: number) => request("POST", `/api/bookings/${id}/complete`, null, true, "amoo_admin_token"),
    cancelBooking: (id: number) => request("DELETE", `/api/bookings/${id}`, null, true, "amoo_admin_token"),

    getPackages: () => request("GET", "/api/packages/all", null, true, "amoo_admin_token"),
    createPackage: (body: unknown) => request("POST", "/api/packages", body, true, "amoo_admin_token"),
    updatePackage: (id: number, body: unknown) => request("PATCH", `/api/packages/${id}`, body, true, "amoo_admin_token"),
    deletePackage: (id: number) => request("DELETE", `/api/packages/${id}`, null, true, "amoo_admin_token"),

    getReports: (query = "") => request("GET", `/api/reports${query}`, null, true, "amoo_admin_token"),
    getReport: (id: number) => request("GET", `/api/reports/${id}`, null, true, "amoo_admin_token"),
    createReport: (body: unknown) => request("POST", "/api/reports/admin", body, true, "amoo_admin_token"),
    updateReport: (id: number, body: unknown) => request("PATCH", `/api/reports/${id}`, body, true, "amoo_admin_token"),
    deleteReport: (id: number) => request("DELETE", `/api/reports/${id}`, null, true, "amoo_admin_token"),

    getPayments: () => request("GET", "/api/payments", null, true, "amoo_admin_token"),
    refundPayment: (id: number, body: unknown) => request("POST", `/api/payments/${id}/refund`, body, true, "amoo_admin_token"),
    getPaymentRefunds: (query = "") => request("GET", `/api/payments/refunds${query}`, null, true, "amoo_admin_token"),
    getPaymentStats: () => request("GET", "/api/payments/stats/overview", null, true, "amoo_admin_token"),

    getCoupons: () => request("GET", "/api/coupons", null, true, "amoo_admin_token"),
    createCoupon: (body: unknown) => request("POST", "/api/coupons", body, true, "amoo_admin_token"),
    updateCoupon: (id: number, body: unknown) => request("PATCH", `/api/coupons/${id}`, body, true, "amoo_admin_token"),
    deleteCoupon: (id: number) => request("DELETE", `/api/coupons/${id}`, null, true, "amoo_admin_token"),

    getSlots: (query = "") => request("GET", `/api/slots${query}`, null, true, "amoo_admin_token"),
    createSlot: (body: unknown) => request("POST", "/api/slots", body, true, "amoo_admin_token"),
    updateSlot: (id: number, body: unknown) => request("PATCH", `/api/slots/${id}`, body, true, "amoo_admin_token"),
    deleteSlot: (id: number) => request("DELETE", `/api/slots/${id}`, null, true, "amoo_admin_token"),

    getContacts: () => request("GET", "/api/contact", null, true, "amoo_admin_token"),
    getContact: (id: number) => request("GET", `/api/contact/${id}`, null, true, "amoo_admin_token"),
    updateContact: (id: number, body: unknown) => request("PATCH", `/api/contact/${id}`, body, true, "amoo_admin_token"),
    deleteContact: (id: number) => request("DELETE", `/api/contact/${id}`, null, true, "amoo_admin_token"),

    getSubscriptions: () => request("GET", "/api/subscriptions/all", null, true, "amoo_admin_token"),
    updateSubscription: (id: number, body: unknown) => request("PATCH", `/api/subscriptions/${id}`, body, true, "amoo_admin_token"),

    getTestimonials: () => request("GET", "/api/testimonials/all", null, true, "amoo_admin_token"),
    updateTestimonial: (id: number, body: unknown) => request("PATCH", `/api/testimonials/${id}`, body, true, "amoo_admin_token"),
    deleteTestimonial: (id: number) => request("DELETE", `/api/testimonials/${id}`, null, true, "amoo_admin_token"),

    getNotifications: () => request("GET", "/api/notifications/all", null, true, "amoo_admin_token"),
    createNotification: (body: unknown) => request("POST", "/api/notifications", body, true, "amoo_admin_token"),
    deleteNotification: (id: number) => request("DELETE", `/api/notifications/${id}`, null, true, "amoo_admin_token"),

    getUploads: () => request("GET", "/api/uploads/all", null, true, "amoo_admin_token"),

    getExperts: (query = "") => request("GET", `/api/experts${query}`, null, true, "amoo_admin_token"),
    createExpert: (body: unknown) => request("POST", "/api/experts", body, true, "amoo_admin_token"),
    updateExpert: (id: number, body: unknown) => request("PATCH", `/api/experts/${id}`, body, true, "amoo_admin_token"),
    deleteExpert: (id: number) => request("DELETE", `/api/experts/${id}`, null, true, "amoo_admin_token"),

    // dashboard
    getOverview: () => request("GET", "/api/dashboard/overview", null, true, "amoo_admin_token"),
    getTopExperts: (limit = 5) =>
      request("GET", `/api/dashboard/experts/top?limit=${limit}`, null, true, "amoo_admin_token"),
    getAudit: (query = "") =>
      request("GET", `/api/audit${query}`, null, true, "amoo_admin_token"),

    // blogs (admin)
    getBlogs: (query = "") => request("GET", `/api/blogs/all${query}`, null, true, "amoo_admin_token"),
    createBlog: (body: unknown) => request("POST", "/api/blogs", body, true, "amoo_admin_token"),
    updateBlog: (id: number, body: unknown) => request("PATCH", `/api/blogs/${id}`, body, true, "amoo_admin_token"),
    deleteBlog: (id: number) => request("DELETE", `/api/blogs/${id}`, null, true, "amoo_admin_token"),

    // faqs (admin)
    getFaqs: () => request("GET", "/api/faqs/all", null, true, "amoo_admin_token"),
    createFaq: (body: unknown) => request("POST", "/api/faqs", body, true, "amoo_admin_token"),
    updateFaq: (id: number, body: unknown) => request("PATCH", `/api/faqs/${id}`, body, true, "amoo_admin_token"),
    deleteFaq: (id: number) => request("DELETE", `/api/faqs/${id}`, null, true, "amoo_admin_token"),

    getBookingsTrends: (period = "month") =>
      request("GET", `/api/dashboard/bookings/trends?period=${period}`, null, true, "amoo_admin_token"),
    getRevenue: (period = "month") =>
      request("GET", `/api/dashboard/revenue?period=${period}`, null, true, "amoo_admin_token"),
    getUsersGrowth: (period = "month") =>
      request("GET", `/api/dashboard/users/growth?period=${period}`, null, true, "amoo_admin_token"),

    exportCSV: async (type: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("amoo_admin_token") : "";
      const res = await fetch(`${API_URL}/api/dashboard/export/${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
  getProfile: () => request("GET", "/api/users/me", null, true),
  updateProfile: (body: unknown) => request("PATCH", "/api/users/me", body, true),
  getBookings: () => request("GET", "/api/bookings", null, true),
  createBooking: (body: unknown) => request("POST", "/api/bookings", body, true),
  getReports: () => request("GET", "/api/reports", null, true),
  getReportStats: () => request("GET", "/api/reports/stats", null, true),
  getWallet: () => request("GET", "/api/wallet", null, true),
  getSubscriptions: () => request("GET", "/api/subscriptions", null, true),
  subscribe: (body: unknown) => request("POST", "/api/subscriptions", body, true),
  getNotifications: (query = "") => request("GET", `/api/notifications${query}`, null, true),
  getUnreadCount: () => request("GET", "/api/notifications/unread-count", null, true),
  markRead: (id: number) => request("POST", `/api/notifications/${id}/read`, null, true),
  markAllRead: () => request("POST", "/api/notifications/read-all", null, true),

  // contact (public)
  sendContact: (body: unknown) => request("POST", "/api/contact", body),

  // payment
  createPaymentOrder: (body: unknown) => request("POST", "/api/payments/create-order", body, true),
  verifyPayment: (body: unknown) => request("POST", "/api/payments/verify", body, true),

  // coupons (public)
  validateCoupon: (code: string) => request("POST", "/api/coupons/validate", { code }),

  // activity tracking
  getMyActivity: (query = "") => request("GET", `/api/activity/mine${query}`, null, true),

  // upload (auth)
  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: authHeader(),
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && (data as any).error) || "Upload failed");
    return data;
  },
};

export default api;
