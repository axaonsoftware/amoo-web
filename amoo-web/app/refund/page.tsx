"use client";

import Link from "next/link";
import { OfferBar, HomeHeader } from "@/app/components/home-header";
import { SiteFooter } from "@/app/components/site-footer";

const RefundPage = () => {
  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: "#fdf8f0" }}>
      <OfferBar />
      <HomeHeader />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1
          className="font-display text-4xl font-bold md:text-5xl"
          style={{ color: "#2c0c47" }}
        >
          Refund Policy
        </h1>
        <p className="mt-3 font-sans text-sm" style={{ color: "#6c6b78" }}>
          Last updated: July 21, 2026
        </p>

        <div className="mt-12 space-y-10 font-sans" style={{ color: "#6c6b78" }}>
          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              1. Eligibility for Refunds
            </h2>
            <p className="mt-4 leading-relaxed">
              We offer refunds for consultation bookings that are cancelled at
              least 24 hours before the scheduled session. Digital products and
              downloadable content are eligible for refunds within 7 days of
              purchase if the product is defective or does not match its
              description. Healing sessions that have been completed are
              non-refundable.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              2. Refund Process
            </h2>
            <p className="mt-4 leading-relaxed">
              To request a refund, please contact our support team via WhatsApp
              or email with your booking reference number and reason for the
              refund request. Our team will review your request within 2
              business days and notify you of the approval or rejection. If
              approved, the refund will be processed to your original payment
              method within 5-10 business days.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              3. Refund Timeframes
            </h2>
            <p className="mt-4 leading-relaxed">
              Refunds for consultation bookings cancelled 24+ hours in advance
              are processed within 5-7 business days. Refunds for defective
              digital products are processed within 7-10 business days after
              verification. Bank processing times may vary depending on your
              financial institution. UPI refunds are typically faster and may
              reflect within 1-2 business days.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              4. Non-Refundable Items
            </h2>
            <p className="mt-4 leading-relaxed">
              Completed consultation sessions (audio, video, or chat) are
              non-refundable. Distance healing sessions that have been initiated
              cannot be refunded. Package deals and promotional offers are
              non-refundable unless specified otherwise. No-shows or late
              cancellations (less than 24 hours before the session) are not
              eligible for refunds.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              5. Contact Us
            </h2>
            <p className="mt-4 leading-relaxed">
              If you have any questions about our refund policy or need
              assistance with a refund request, please contact our support team.
              We are committed to resolving any concerns promptly and ensuring
              your satisfaction with our spiritual wellness services.
            </p>
          </section>
        </div>

        <div className="mt-16">
          <Link
            href="/"
            className="font-sans text-sm font-medium transition-colors hover:underline"
            style={{ color: "#2c0c47" }}
          >
            &larr; Back to Home
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default RefundPage;
