/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production.
 * Defaults to the local dev origin so build doesn't crash before deploy.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
