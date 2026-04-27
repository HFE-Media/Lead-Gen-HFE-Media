export const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GOOGLE_PLACES_API_KEY"] as const;

export function getEnv(name: (typeof requiredEnv)[number] | "NEXT_PUBLIC_APP_URL") {
  const value = process.env[name];

  if (!value && requiredEnv.includes(name as (typeof requiredEnv)[number])) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value ?? "";
}

export function getMissingEnv() {
  return requiredEnv.filter((name) => !process.env[name]);
}

export function hasCoreEnv() {
  return getMissingEnv().length === 0;
}
