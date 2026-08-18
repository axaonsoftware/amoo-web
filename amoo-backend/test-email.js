#!/usr/bin/env node
/**
 * Tests the email system using Ethereal (fake SMTP).
 * Emails are NOT delivered to a real inbox — they appear at a preview URL.
 */

const nodemailer = require("nodemailer");

async function main() {
  const recipient = process.argv[2] || "test@example.com";

  console.log("Creating temporary Ethereal test account...\n");
  const testAccount = await nodemailer.createTestAccount();

  console.log(`  SMTP User : ${testAccount.user}`);
  console.log(`  SMTP Pass : ${testAccount.pass}`);
  console.log(`  SMTP Host : ${testAccount.smtp.host}:${testAccount.smtp.port}`);
  console.log("");

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const testToken = "test_" + Date.now().toString(36);
  const link = `http://localhost:3000/verify-email#email=${encodeURIComponent(recipient)}&token=${testToken}`;

  try {
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅  SMTP connection OK\n");

    console.log("Sending test verification email...");
    const info = await transporter.sendMail({
      from: "no-reply@amooguru.com",
      to: recipient,
      subject: "Amoo Guru — Verify your email",
      text: `Click to verify your email: ${link}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;">
          <h2 style="color:#333;">Amoo Guru</h2>
          <p>Thanks for signing up! Click the button below to verify your email.</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Verify Email</a>
          <p style="color:#888;font-size:12px;">This link expires in 24 hours.</p>
          <p style="color:#888;font-size:12px;">Token: ${testToken}</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log("✅  Email sent successfully!\n");
    console.log("── Result ──");
    console.log(`  Message ID : ${info.messageId}`);
    console.log(`  Preview    : ${previewUrl}`);
    console.log("\n   Open the preview URL above to see the email.");

  } catch (err) {
    console.error("❌  Failed:", err.message);
    process.exit(1);
  }
}

main();
