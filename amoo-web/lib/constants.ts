// Site-wide constants — all values can be overridden via NEXT_PUBLIC_* env vars.

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Amoo Guru";

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91 98765 43210";

/** Digits-only version of the WhatsApp number for use in wa.me and tel: URLs. */
export const WHATSAPP_RAW = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_RAW}`;
export const TEL_URL = `tel:+${WHATSAPP_RAW}`;

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@amooguru.com";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || WHATSAPP_NUMBER;
