import { z } from "zod";

/**
 * Runtime configuration validated at startup (spec §17.1).
 * Missing or invalid values must fail fast — the process must not boot
 * with a half-configured secret set. Secrets stay server-side only.
 */
const envSchema = z.object({
  APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),

  DATABASE_URL: z.string().url(),
  DATABASE_MIGRATION_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),

  API_PORT: z.coerce.number().int().positive().default(3001),
  PUBLIC_APP_URL: z.string().url(),

  OIDC_ISSUER_URL: z.string().url().optional(),

  PAYMENT_PROVIDER_MODE: z.enum(["test", "live"]).default("test"),
  PAYMENT_SECRET_KEY: z.string().min(1).optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().min(1).optional(),

  OBJECT_STORAGE_BUCKET: z.string().min(1).default("restaurantos-local"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().min(1).optional(),
  S3_SECRET_KEY: z.string().min(1).optional(),

  DEFAULT_LOCATION_TIMEZONE: z.string().min(1).default("Europe/Berlin"),

  AI_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // Fail fast with sanitized issue list (values are never printed).
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  const config = parsed.data;

  if (config.APP_ENV === "production") {
    const missing: string[] = [];
    if (!config.OIDC_ISSUER_URL) missing.push("OIDC_ISSUER_URL");
    if (!config.PAYMENT_SECRET_KEY) missing.push("PAYMENT_SECRET_KEY");
    if (!config.PAYMENT_WEBHOOK_SECRET) missing.push("PAYMENT_WEBHOOK_SECRET");
    if (missing.length > 0) {
      throw new Error(
        `Missing required production secrets: ${missing.join(", ")}`,
      );
    }
  }

  return Object.freeze(config);
}
