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
  if (!env.email.enabled) {
    // Dev mode: don't send. Caller decides what to surface.
    return { sent: false, dev: true };
  }
  const t = getTransporter();
  try {
    await t.sendMail({ from: env.email.from, to, subject, text, html });
    return { sent: true, dev: false };
  } catch (err) {
    if (!env.isProd) {
      return { sent: false, dev: true };
    }
    throw err;
  }
}

module.exports = { sendMail };
