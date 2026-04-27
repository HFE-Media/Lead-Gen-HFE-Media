export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function normalizePhone(value: string | null) {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

export function toCsvRow(values: Array<string | number | null>) {
  return values
    .map((value) => {
      const text = `${value ?? ""}`.replace(/"/g, "\"\"");
      return `"${text}"`;
    })
    .join(",");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
