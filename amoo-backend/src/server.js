const express = require("express");
const cors = require("cors");
const path = require("path");
const { testConnection } = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const expertRoutes = require("./routes/experts");
const serviceRoutes = require("./routes/services");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const slotRoutes = require("./routes/slots");
const reportRoutes = require("./routes/reports");
const packageRoutes = require("./routes/packages");
const testimonialRoutes = require("./routes/testimonials");
const dashboardRoutes = require("./routes/dashboard");
const walletRoutes = require("./routes/wallet");
const subscriptionRoutes = require("./routes/subscriptions");
const notificationRoutes = require("./routes/notifications");
const contactRoutes = require("./routes/contact");
const uploadRoutes = require("./routes/uploads");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

if (require.main === module) {
  testConnection()
    .then(() => {
      app.listen(PORT, () => console.log(`[server] API listening on http://localhost:${PORT}`));
    })
    .catch((e) => {
      console.error("[server] Could not connect to MySQL:", e.message);
      console.error("[server] Starting anyway (DB calls will fail until MySQL is available).");
      app.listen(PORT, () => console.log(`[server] API listening on http://localhost:${PORT} (DB unavailable)`));
    });
}

module.exports = app;
