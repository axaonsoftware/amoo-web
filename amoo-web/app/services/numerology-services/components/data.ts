import {
  UserRound,
  Type,
  Baby,
  Briefcase,
  Tag,
  Smartphone,
  Car,
  HeartHandshake,
  TrendingUp,
  DollarSign,
  CalendarDays,
  Palette,
  BadgeCheck,
  UserCog,
  Lock,
  Headset,
  FileText,
  Flower2,
  Compass,
  Wand2,
  Download,
  LucideIcon,
} from "lucide-react";

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Consultation", href: "/consultation" },
  { label: "Pricing", href: "/consultation/consultation-pricing" },
  { label: "Software", href: "/software-hub" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export type FeatureItem = { icon: LucideIcon; label: string };

export const HERO_FEATURES: FeatureItem[] = [
  { icon: BadgeCheck, label: "Accurate\nAnalysis" },
  { icon: UserCog, label: "Personalized\nGuidance" },
  { icon: Lock, label: "Confidential\n& Safe" },
  { icon: Headset, label: "Expert\nSupport" },
];

export type ServiceItem = {
  icon?: LucideIcon;
  glyph?: string;
  title: string;
  desc: string;
};

export const SERVICES: ServiceItem[] = [
  {
    icon: UserRound,
    title: "Personal Numerology",
    desc: "Get a complete analysis of your birth numbers and life path.",
  },
  {
    icon: Type,
    title: "Name Numerology",
    desc: "Analyze your name and discover its impact on your life.",
  },
  {
    glyph: "A→Z",
    title: "Name Correction",
    desc: "Correct your name spelling and align with positive energies.",
  },
  {
    icon: Baby,
    title: "Baby Name Numerology",
    desc: "Choose the most auspicious name for your baby.",
  },
  {
    icon: Briefcase,
    title: "Business Numerology",
    desc: "Find the perfect name and number combination for your business.",
  },
  {
    icon: Tag,
    title: "Brand Name Numerology",
    desc: "Create a powerful brand identity with the right vibrations.",
  },
  {
    icon: Smartphone,
    title: "Mobile Number Analysis",
    desc: "Check how your mobile number influences your life.",
  },
  {
    icon: Car,
    title: "Vehicle Number Analysis",
    desc: "Ensure safety, success and positivity in every journey.",
  },
  {
    icon: HeartHandshake,
    title: "Marriage Compatibility",
    desc: "Check compatibility and build strong, lasting relationships.",
  },
  {
    icon: TrendingUp,
    title: "Career Numerology",
    desc: "Discover the best career path aligned with your strengths.",
  },
  {
    icon: DollarSign,
    title: "Financial Numerology",
    desc: "Attract wealth and financial stability with numbers.",
  },
  {
    icon: CalendarDays,
    title: "Personal Year Prediction",
    desc: "Know what the year ahead holds for you.",
  },
  {
    glyph: "horseshoe",
    title: "Lucky Numbers",
    desc: "Find your lucky numbers for success and abundance.",
  },
  {
    icon: Palette,
    title: "Lucky Colors",
    desc: "Discover colors that bring luck and positivity.",
  },
  {
    glyph: "signature",
    title: "Signature Numerology",
    desc: "Align your signature for more success and recognition.",
  },
];

export const RECEIVE_ITEMS: FeatureItem[] = [
  { icon: FileText, label: "Detailed\nNumerology Report" },
  { icon: Flower2, label: "Strengths &\nWeakness Analysis" },
  { icon: Compass, label: "Life Path\nInsights" },
  { icon: Wand2, label: "Lucky Numbers\n& Colors" },
  { icon: HeartHandshake, label: "Remedies &\nGuidance" },
  { icon: Download, label: "PDF Report\n(Download)" },
];

export const TESTIMONIALS = [
  {
    name: "Neha Sharma",
    text: "The name correction suggested by Surinder Ji brought amazing changes in my career and confidence.",
  },
  {
    name: "Rohit Malhotra",
    text: "Business numerology analysis helped us choose the right name and our growth increased rapidly.",
  },
  {
    name: "Priya Verma",
    text: "Personal numerology reading was very accurate. It gave me clarity and peace of mind.",
  },
];

export const FOOTER_COLS = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Consultation", href: "/consultation" },
      { label: "Pricing", href: "/consultation/consultation-pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { label: "Numerology", href: "/services/numerology-services" },
      { label: "Reiki Healing", href: "/services/reiki-healing" },
      { label: "Tarot Reading", href: "/services/tarot-reading" },
      { label: "Kundali & Astrology", href: "/services" },
      { label: "Chakra Healing", href: "/services/reiki-healing" },
      { label: "Spiritual Guidance", href: "/services" },
    ],
  },
  {
    title: "Consultation",
    links: [
      { label: "Audio Call", href: "/consultation/select-service" },
      { label: "Video Call", href: "/consultation/select-service" },
      { label: "Chat Consultation", href: "/consultation/select-service" },
      { label: "Distance Healing", href: "/consultation/select-service" },
      { label: "In-Person Meeting", href: "/consultation/select-service" },
      { label: "Packages", href: "/consultation/consultation-pricing" },
    ],
  },
];
