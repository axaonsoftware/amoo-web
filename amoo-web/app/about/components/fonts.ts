import { Great_Vibes } from "next/font/google";

/** Handwritten signature used in the hero and the mission / vision band. */
export const greatVibes = Great_Vibes({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
  fallback: ["cursive", "serif"],
});
