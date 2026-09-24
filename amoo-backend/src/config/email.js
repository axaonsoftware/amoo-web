// Email sender. Uses SMTP (nodemailer) when EMAIL_ENABLED=true; otherwise it is
// a no-op that the caller can use to return dev tokens / log links.
const env = require("./env");

let transporter = null;
function getTransporter() {
  if (transporter || !env.email.enabled) return transporter;
  // eslint-disable-next-line global-require
  const nodemailer = require("nodemailer");
  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.pass },
    connectionTimeout: 10000, // 10s to establish connection
    socketTimeout: 5000,      // 5s for send/receive
  });
  return transporter;
}

// sendMail({ to, subject, text, html }) -> { sent, dev }
async function sendMail({ to, subject, text, html }) {
  console.log("[email] sendMail called", {
    enabled: env.email.enabled,
    host: env.email.host,
    port: env.email.port,
    user: env.email.user,
    passLength: env.email.pass?.length,
    from: env.email.from,
  });
  if (!env.email.enabled) {
    if (env.isProd) {
      throw new Error(
        "Cannot send email: EMAIL_ENABLED is false. " +
        "Set EMAIL_ENABLED=true and configure EMAIL_HOST, EMAIL_PORT, " +
        "EMAIL_USER, EMAIL_PASS (and optionally EMAIL_FROM) in production."
      );
    }
    // Dev mode: don't send. Caller decides what to surface.
    return { sent: false, dev: true };
  }
  const t = getTransporter();
  try {
    await t.sendMail({ from: env.email.from, to, subject, text, html });
    console.log("[email] SMTP config:", {
      host: env.email.host,
      port: env.email.port,
      user: env.email.user,
      passLength: env.email.pass?.length,
      from: env.email.from,
    });
    return { sent: true, dev: false };
  } catch (err) {
    console.error("[email] SMTP send failed:", err);
    return { sent: false, dev: true, error: err.message };
  }
}

module.exports = { sendMail };
