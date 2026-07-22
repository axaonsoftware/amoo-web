"use client";

import OfferBar from "@/app/components/OfferBar";
import HomeHeader from "@/app/components/HomeHeader";
import SiteFooter from "@/app/components/SiteFooter";

const CookiePage = () => {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fdf8f0" }}>
      <OfferBar />
      <HomeHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1
          className="font-display text-4xl font-bold md:text-5xl"
          style={{ color: "#2c0c47" }}
        >
          Cookie Policy
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
              1. What Are Cookies
            </h2>
            <p className="mt-4 leading-relaxed">
              Cookies are small text files that are stored on your device when
              you visit our website. They help us provide you with a better
              experience by remembering your preferences, understanding how you
              use our site, and enabling certain features to function properly.
              Cookies do not contain personally identifiable information unless
              you have provided it to us.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              2. Types of Cookies We Use
            </h2>
            <p className="mt-4 leading-relaxed">
              We use essential cookies that are necessary for the website to
              function, including session management, authentication, and
              security cookies. We also use analytics cookies to understand how
              visitors interact with our site, which helps us improve our
              services. Functional cookies remember your preferences such as
              language and region settings. Marketing cookies may be used to
              deliver relevant advertisements and track campaign performance.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              3. Managing Cookies
            </h2>
            <p className="mt-4 leading-relaxed">
              You can control and manage cookies through your browser settings.
              Most browsers allow you to block or delete cookies, or to set
              preferences for certain websites. Please note that disabling
              essential cookies may affect the functionality of our website and
              prevent you from accessing certain features, including booking
              consultations and accessing your account.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: "#2c0c47" }}
            >
              4. Updates to This Policy
            </h2>
            <p className="mt-4 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or for legal, operational, or regulatory
              reasons. We will notify you of any significant changes by posting
              the updated policy on our website with a revised effective date.
              Your continued use of our website after any changes constitutes
              acceptance of the updated policy.
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
              If you have any questions about our use of cookies or this Cookie
              Policy, please contact us through our support channels. We are
              committed to being transparent about the data we collect and how
              it is used to improve your spiritual wellness journey with Amoo
              Guru.
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

export default CookiePage;
