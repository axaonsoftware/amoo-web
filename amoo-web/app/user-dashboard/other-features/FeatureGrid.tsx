import FeatureCard from "./FeatureCard";
import ProfilePhone from "./phones/ProfilePhone";
import BookingPhone from "./phones/BookingPhone";
import CallPhone from "./phones/CallPhone";
import ReportsPhone from "./phones/ReportsPhone";
import HoroscopePhone from "./phones/HoroscopePhone";
import ChatPhone from "./phones/ChatPhone";
import CoursesPhone from "./phones/CoursesPhone";
import RemediesPhone from "./phones/RemediesPhone";
import WalletPhone from "./phones/WalletPhone";

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-x-[20px] gap-y-[24px] lg:grid-cols-2 xl:grid-cols-3">
      <FeatureCard
        title="1. Profile & Settings"
        bullets={[
          "Complete your profile",
          "Update birth details",
          "Manage preferences",
          "Privacy & security",
        ]}
        phone={<ProfilePhone />}
      />
      <FeatureCard
        title="2. Book Consultations"
        bullets={[
          "Choose service",
          "Select astrologer",
          "Pick date & time",
          "Instant confirmation",
        ]}
        phone={<BookingPhone />}
      />
      <FeatureCard
        title="3. Connect & Consult"
        bullets={[
          "Chat, audio or video calls",
          "Real-time with experts",
          "Safe & secure platform",
        ]}
        phone={<CallPhone />}
      />
      <FeatureCard
        title="4. Detailed Reports"
        bullets={[
          "Kundali & horoscope",
          "Numerology reports",
          "Tarot reading",
          "Aura & past life reports",
          "Download & share",
        ]}
        phone={<ReportsPhone />}
      />
      <FeatureCard
        title="5. Daily Horoscope"
        bullets={[
          "Daily predictions",
          "Love, Career, Health, Finance",
          "Personalized insights based on your sign",
        ]}
        phone={<HoroscopePhone />}
      />
      <FeatureCard
        title="6. AI Astro Chat"
        bullets={[
          "24x7 AI support",
          "Ask any astrology question",
          "Get instant answers",
        ]}
        phone={<ChatPhone />}
      />
      <FeatureCard
        title="7. Courses & Learning"
        bullets={[
          "Spiritual & astrology courses",
          "Learn at your own pace",
          "Certificates on completion",
        ]}
        phone={<CoursesPhone />}
      />
      <FeatureCard
        title="8. Remedies & Solutions"
        bullets={[
          "Personalized remedies",
          "Mantras, yantras, gemstones",
          "Step-by-step guidance",
        ]}
        phone={<RemediesPhone />}
      />
      <FeatureCard
        title="9. My Wallet & Payments"
        bullets={[
          "Secure payments",
          "Wallet balance",
          "Transaction history",
          "Multiple payment methods",
        ]}
        phone={<WalletPhone />}
      />
    </div>
  );
}
