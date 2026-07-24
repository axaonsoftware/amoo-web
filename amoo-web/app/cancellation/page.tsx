"use client";

import Link from "next/link";
import { OfferBar, HomeHeader } from "@/app/components/home-header";
import { SiteFooter } from "@/app/components/site-footer";

const CancellationPage = () => {
  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: "#fdf8f0" }}>
      <OfferBar />
      <HomeHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1
          className="font-display text-4xl font-bold md:text-5xl"
          style={{ color: "#2c0c47" }}
        >
          Cancellation Policy
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
              1. How to Cancel
            </h2>
            <p className="mt-4 leading-relaxed">
              You can cancel your booking by logging into your account and
              navigating to the My Bookings section, or by contacting our support
              team via WhatsApp or email. Please provide your booking reference
              number and reason for cancellation. Our team will confirm the
              cancellation and any applicable refund within 2 business days.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              2. Cancellation Timeframes
            </h2>
            <p className="mt-4 leading-relaxed">
              Free cancellation is available up to 24 hours before your scheduled
              consultation. Cancellations made between 12-24 hours before the
              session may incur a 50% cancellation fee. Cancellations made less
              than 12 hours before the session are not eligible for a refund.
              For distance healing sessions, cancellation must be made before the
              session initiation time.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              3. Effects of Cancellation
            </h2>
            <p className="mt-4 leading-relaxed">
              Upon cancellation, your booking will be marked as cancelled and the
              time slot will be released. If you have a package deal, the
              cancelled session will be deducted from your package balance.
              Any promotional discounts applied to the booking may not be
              transferable to future bookings. You will receive a confirmation
              notification via email and WhatsApp once the cancellation is
              processed.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              4. Subscription Cancellations
            </h2>
            <p className="mt-4 leading-relaxed">
              If you have an active subscription plan, you may cancel your
              subscription at any time. The cancellation will take effect at the
              end of the current billing cycle. You will continue to have access
              to your subscription benefits until the end of the paid period.
              No partial refunds are provided for unused portions of a
              subscription period.
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
              If you have any questions about our cancellation policy or need
              assistance with cancelling a booking, please reach out to our
              support team. We are here to help and ensure your experience with
              Amoo Guru is smooth and satisfactory.
            </p>
          </section>
        </div>

        <div className="mt-16">
          {/* <Link>, not <a>: a bare anchor to an internal route triggers a
              full document reload, discarding the client-side router state and
              re-downloading the whole bundle. */}
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

export default CancellationPage;
