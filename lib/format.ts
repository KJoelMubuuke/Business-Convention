export function money(n: number | string) {
  return "UGX " + Number(n).toLocaleString("en-UG");
}

export function clean(v: FormDataEntryValue | string | null | undefined): string {
  return String(v ?? "").trim().replace(/\s+/g, " ");
}

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s\-'])(\w)/g, (_m, a, b) => a + b.toUpperCase());
}

export function normalise(s: string): string {
  return titleCase(clean(s));
}

export function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-UG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
