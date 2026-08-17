import Link from "next/link";
import { SITE_NAME } from "../../lib/constants";

const sections: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "Home",
      links: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Services Overview", href: "/services" },
        { label: "Tarot Reading", href: "/services/tarot-reading" },
        { label: "Reiki Healing", href: "/services/reiki-healing" },
        { label: "Numerology Services", href: "/services/numerology-services" },
      ],
    },
    {
      title: "Consultation",
      links: [
        { label: "Overview", href: "/consultation" },
        { label: "Pricing", href: "/consultation/consultation-pricing" },
        { label: "Payment", href: "/consultation/consultation-payment" },
        { label: "Consultation Mode", href: "/consultation/consultation-mode" },
        { label: "Select Date/Time", href: "/consultation/select-date-time" },
        {
          label: "Consultation Booking",
          href: "/consultation/consultation-booking",
        },
        { label: "Booking Summary", href: "/consultation/booking-summary" },
        {
          label: "Booking Confirmation",
          href: "/consultation/booking-confirmation",
        },
      ],
    },
    {
      title: "Software",
      links: [
        { label: "Software Hub", href: "/software-hub" },
        {
          label: "Basic Kundali",
          href: "/software-hub/basic-kundali-software",
        },
        { label: "Tarot Software", href: "/software-hub/tarot-software" },
        {
          label: "Numerology Software",
          href: "/software-hub/numerology-software",
        },
      ],
    },
    {
      title: "Dashboards",
      links: [
        {
          label: "Kundali Dashboard",
          href: "/user-dashboard/kundali-dashboard",
        },
        {
          label: "Numerology Dashboard",
          href: "/user-dashboard/numerology-dashboard",
        },
        { label: "Reiki Dashboard", href: "/user-dashboard/reiki-dashboard" },
        { label: "Tarot Dashboard", href: "/user-dashboard/tarot-dashboard" },
      ],
    },
    {
      title: "User Dashboard",
      links: [
        { label: "Dashboard", href: "/user-dashboard" },
        { label: "Account & Profile", href: "/user-dashboard/account-profile" },
        {
          label: "My Consultations",
          href: "/user-dashboard/consultations-booking",
        },
        {
          label: "Kundali Dashboard",
          href: "/user-dashboard/kundali-dashboard",
        },
        { label: "My Reports", href: "/user-dashboard/my-reports" },
        {
          label: "Numerology Dashboard",
          href: "/user-dashboard/numerology-dashboard",
        },
        { label: "Other Features", href: "/user-dashboard/other-features" },
        {
          label: "Payments & Subscription",
          href: "/user-dashboard/payments-subscription",
        },
        { label: "Reiki Dashboard", href: "/user-dashboard/reiki-dashboard" },
        { label: "Tarot Dashboard", href: "/user-dashboard/tarot-dashboard" },
        { label: "User Login", href: "/user-login" },
      ],
    },
    {
      title: "Auth",
      links: [
        { label: "User Login", href: "/user-login" },
        { label: "Admin Login", href: "/admin-login" },
      ],
    },
    {
      title: "Admin",
      links: [
        { label: "Admin Dashboard", href: "/admin/admin-dashboard" },
        { label: "Availability & Slots", href: "/admin/availability-slots" },
        { label: "Booking Management", href: "/admin/booking-management" },
        {
          label: "Consultation Management",
          href: "/admin/consultation-management",
        },
        { label: "Kundali Management", href: "/admin/kundali-management" },
        {
          label: "Numerology Management",
          href: "/admin/numerology-management",
        },
        { label: "Packages & Offers", href: "/admin/packages-offers" },
        { label: "Payments & Finance", href: "/admin/payments-finance" },
        { label: "Pricing Management", href: "/admin/pricing-management" },
        { label: "Reiki Management", href: "/admin/reiki-management" },
        { label: "Reports & Analytics", href: "/admin/reports-analytics" },
        { label: "Services Management", href: "/admin/services-management" },
        { label: "Tarot Management", href: "/admin/tarot-management" },
        { label: "User Management", href: "/admin/user-management" },
      ],
    },
  ];

export default function SitemapPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#0D0218] px-4 py-12 text-white"
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gold">Sitemap</h1>
        <p className="mt-2 text-white/60">All pages on {SITE_NAME}</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="border-b border-white/10 pb-2 text-sm font-semibold uppercase tracking-wider text-gold/80">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-white/70 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
