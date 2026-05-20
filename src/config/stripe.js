/**
 * Stripe publishable key — set REACT_APP_STRIPE_PUBLISHABLE_KEY in .env (project root),
 * then restart `npm start`. Optional fallback: public/stripe-config.json
 */
const fromEnv = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

export const STRIPE_PUBLISHABLE_KEY = typeof fromEnv === "string" ? fromEnv.trim() : "";

export async function resolveStripePublishableKey() {
  if (STRIPE_PUBLISHABLE_KEY) {
    return STRIPE_PUBLISHABLE_KEY;
  }

  try {
    const base = process.env.PUBLIC_URL || "";
    const res = await fetch(`${base}/stripe-config.json`, { cache: "no-store" });
    if (!res.ok) return "";

    const data = await res.json();
    const fromFile = (data.publishableKey || data.stripePublishableKey || "").trim();
    return fromFile;
  } catch {
    return "";
  }
}
