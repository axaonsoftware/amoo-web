const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("../utils/logger");

// Lazy transport — created on first send so we don't fail at import time
// when EMAIL_* vars aren't set (common in dev).
let _transport = null;

function getTransport() {
  if (!env.email.enabled) return null;
  if (!_transport) {
    _transport = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }
  return _transport;
}

/**
 * Send a plain-text or HTML email.
 * Errors are logged but never thrown — callers should never await this
 * in the critical request path.
 */
async function send({ to, bcc, subject, html, text }) {
  const transport = getTransport();
  // Recipient addresses are personal data — never write them to the log.
  const label = bcc ? `${countRecipients(bcc)} bcc recipient(s)` : redact(to);
  if (!transport) {
    logger.info(`[email] Skipped send to ${label} (EMAIL_ENABLED=false)`);
    return;
  }
  try {
    const info = await transport.sendMail({
      from: env.email.from,
      // A bulk send addresses the envelope to ourselves and puts the real
      // recipients in Bcc, so no recipient can see any other recipient.
      to: bcc ? env.email.from : to,
      bcc: bcc || undefined,
      subject,
      html: html || undefined,
      text: text || undefined,
    });
    logger.info(`[email] Sent to ${label} (msgId: ${info.messageId})`);
  } catch (err) {
    logger.error(`[email] Failed to send to ${label}: ${err.message}`);
  }
}

// "alice@example.com" -> "a***@example.com"
function redact(address) {
  const first = String(address || "").split(",")[0].trim();
  const at = first.indexOf("@");
  if (at < 1) return "<recipient>";
  return `${first[0]}***${first.slice(at)}`;
}

function countRecipients(list) {
  return Array.isArray(list) ? list.length : String(list).split(",").filter(Boolean).length;
}

/**
 * Send one message to many recipients without disclosing the list.
 *
 * Recipients go in Bcc and are chunked, because most SMTP providers cap
 * recipients per message (SES 50, SendGrid 1000, Gmail 100). A single
 * comma-joined header both leaks every address and is rejected past the cap.
 */
async function sendBulk({ recipients, subject, html, text, chunkSize = 50 }) {
  const unique = [...new Set((recipients || []).map((r) => String(r).trim()).filter(Boolean))];
  if (!unique.length) return { sent: 0, batches: 0 };

  let batches = 0;
  for (let i = 0; i < unique.length; i += chunkSize) {
    await send({ bcc: unique.slice(i, i + chunkSize), subject, html, text });
    batches++;
  }
  return { sent: unique.length, batches };
}

/**
 * Send a notification email to one or more recipients.
 *
 * @param {string} to        - single email or comma-separated list
 * @param {string} title     - notification title
 * @param {string} message   - notification body (may contain newlines)
 * @param {object} [opts]    - { appUrl, unsubscribeHref }
 */
async function sendNotificationEmail(to, title, message, opts = {}) {
  const appUrl = opts.appUrl || env.clientUrl;
  const html = [
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">`,
    `<style>`,
    `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f3f0}`,
    `.container{max-width:560px;margin:0 auto;padding:24px 20px}`,
    `.card{background:#fff;border-radius:16px;padding:28px 24px;box-shadow:0 2px 12px rgba(0,0,0,.06)}`,
    `.badge{display:inline-block;background:#f3ecfb;color:#7c3aed;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600}`,
    `h2{font-size:20px;color:#2b0f47;margin:16px 0 8px}`,
    `p{font-size:15px;line-height:1.6;color:#4a3f5c}`,
    `.btn{display:inline-block;background:linear-gradient(135deg,#5b21b6,#7c3aed);color:#fff;padding:10px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;margin-top:12px}`,
    `.footer{margin-top:24px;font-size:12px;color:#9a92ab;text-align:center}`,
    `</style></head><body>`,
    `<div class="container">`,
    `<div class="card">`,
    `<span class="badge">Amoo Guru</span>`,
    `<h2>${escapeHtml(title)}</h2>`,
    `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    `<a href="${appUrl}/user-dashboard" class="btn">View in Dashboard</a>`,
    `</div>`,
    `<div class="footer">`,
    `<p>Amoo Guru — Spirituality Meets Technology</p>`,
    opts.unsubscribeHref
      ? `<p><a href="${opts.unsubscribeHref}" style="color:#9a92ab;text-decoration:underline">Unsubscribe</a></p>`
      : "",
    `</div>`,
    `</div></body></html>`,
  ].join("\n");

  const payload = {
    subject: title,
    html,
    text: `${title}\n\n${message}\n\n— Amoo Guru\n${appUrl}/user-dashboard`,
  };

  // An array of recipients is a broadcast: fan it out over Bcc batches rather
  // than exposing every address in a shared To: header.
  if (Array.isArray(to)) return sendBulk({ recipients: to, ...payload });
  return send({ to, ...payload });
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { send, sendBulk, sendNotificationEmail, getTransport };
