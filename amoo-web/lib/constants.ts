// Site-wide constants — all values can be overridden via NEXT_PUBLIC_* env vars.

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Amoo Guru";

const PLACEHOLDER_PHONE = "+91 72909 12315";
const RAW_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
export const WHATSAPP_NUMBER = RAW_WHATSAPP || PLACEHOLDER_PHONE;

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  !RAW_WHATSAPP
) {
  console.warn(
    "CRITICAL: NEXT_PUBLIC_WHATSAPP_NUMBER is not set. Using placeholder number.",
  );
}

/** Digits-only version of the WhatsApp number for use in wa.me and tel: URLs. */
export const WHATSAPP_RAW = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  WHATSAPP_RAW.length < 10
) {
  console.warn(
    "CRITICAL: WhatsApp number appears invalid (digits:",
    WHATSAPP_RAW.length,
    ")",
  );
}

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_RAW}`;
export const TEL_URL = `tel:+${WHATSAPP_RAW}`;

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@amooguru.com";
export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || WHATSAPP_NUMBER;

export const PROMO_CODE = process.env.NEXT_PUBLIC_PROMO_CODE || "AMOOGURU15";

export const SOCIAL_LINKS = {
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/amoooguru",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://instagram.com/amooguru_official",
  youtube:
    process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com/@amoooguru",
} as const;

export const BUSINESS_HOURS =
  process.env.NEXT_PUBLIC_BUSINESS_HOURS || "Mon - Sat: 10 AM - 8 PM";
