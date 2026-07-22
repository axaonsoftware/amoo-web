"use client";

import OfferBar from "@/app/components/OfferBar";
import HomeHeader from "@/app/components/HomeHeader";
import SiteFooter from "@/app/components/SiteFooter";

const TermsPage = () => {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fdf8f0" }}>
      <OfferBar />
      <HomeHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1
          className="font-display text-4xl font-bold md:text-5xl"
          style={{ color: "#2c0c47" }}
        >
          Terms & Service
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
              1. Acceptance of Terms
            </h2>
            <p className="mt-4 leading-relaxed">
              By accessing or using our website and services, you agree to be
              bound by these Terms of Service. If you do not agree with any part
              of these terms, you must discontinue use of our services
              immediately. We reserve the right to modify these terms at any
              time, and continued use of the service constitutes acceptance of
              any changes.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              2. User Accounts
            </h2>
            <p className="mt-4 leading-relaxed">
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. Failure to do
              so constitutes a breach of the Terms, which may result in immediate
              termination of your account. You are responsible for safeguarding
              the password used to access our service and for all activities that
              occur under your account.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              3. Intellectual Property
            </h2>
            <p className="mt-4 leading-relaxed">
              All content, trademarks, logos, and intellectual property displayed
              on this website are the exclusive property of Amoo or its licensors
              and are protected by applicable copyright, trademark, and other
              intellectual property laws. You may not reproduce, distribute, or
              create derivative works from any content without prior written
              consent.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              4. Limitation of Liability
            </h2>
            <p className="mt-4 leading-relaxed">
              To the maximum extent permitted by applicable law, Amoo shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use our
              services. Our total liability for any claim arising from these
              terms shall not exceed the amount you paid to us in the twelve
              months preceding the claim.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              5. Governing Law
            </h2>
            <p className="mt-4 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Amoo operates, without
              regard to its conflict of law provisions. Any disputes arising
              under these Terms shall be resolved exclusively in the courts of
              that jurisdiction.
            </p>
          </section>
        </div>

        <div className="mt-16">
          <a
            href="/"
            className="font-sans text-sm font-medium transition-colors hover:underline"
            style={{ color: "#2c0c47" }}
          >
            &larr; Back to Home
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default TermsPage;
