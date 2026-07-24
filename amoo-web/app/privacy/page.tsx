"use client";

import Link from "next/link";
import { OfferBar, HomeHeader } from "@/app/components/home-header";
import { SiteFooter } from "@/app/components/site-footer";

const PrivacyPage = () => {
  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: "#fdf8f0" }}>
      <OfferBar />
      <HomeHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1
          className="font-display text-4xl font-bold md:text-5xl"
          style={{ color: "#2c0c47" }}
        >
          Privacy Policy
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
              1. Information We Collect
            </h2>
            <p className="mt-4 leading-relaxed">
              We collect personal information you provide directly to us, such as
              your name, email address, phone number, and payment details when
              you register for an account, make a purchase, or contact our
              support team. We also automatically collect certain information
              about your device, including your IP address, browser type,
              operating system, and usage data through cookies and similar
              technologies.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              2. Use of Information
            </h2>
            <p className="mt-4 leading-relaxed">
              We use the information we collect to provide, maintain, and improve
              our services; process transactions and send related information;
              send technical notices, updates, security alerts, and support
              messages; respond to your comments, questions, and customer service
              requests; and to monitor and analyze trends, usage, and
              activities in connection with our services.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              3. Data Sharing
            </h2>
            <p className="mt-4 leading-relaxed">
              We do not sell your personal information. We may share your
              information with trusted third-party service providers who assist
              us in operating our website and conducting our business, so long as
              those parties agree to keep this information confidential. We may
              also release your information when we believe release is appropriate
              to comply with the law, enforce our site policies, or protect ours
              or others rights, property, or safety.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              4. Data Security
            </h2>
            <p className="mt-4 leading-relaxed">
              We implement a variety of security measures to maintain the safety
              of your personal information. Your personal data is stored in
              secured networks and is only accessible by a limited number of
              authorized personnel who have special access rights. However, no
              method of transmission over the Internet or electronic storage is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              5. Your Rights
            </h2>
            <p className="mt-4 leading-relaxed">
              You have the right to access, correct, or delete your personal
              information at any time. You may also opt out of receiving
              marketing communications from us by following the unsubscribe link
              in our emails. To exercise any of these rights, please contact us
              using the details provided below.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              6. Contact Us
            </h2>
            <p className="mt-4 leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@amoo.com or reach out through our contact
              page. We are committed to resolving any privacy concerns promptly
              and transparently.
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

export default PrivacyPage;
