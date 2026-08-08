const LOCAL_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return LOCAL_ORIGIN;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getSiteOrigin() {
  return normalizeOrigin(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.CF_PAGES_URL ??
      process.env.VERCEL_URL ??
      LOCAL_ORIGIN,
  );
}