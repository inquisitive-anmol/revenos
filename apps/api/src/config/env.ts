import { z } from 'zod';
import { config } from 'dotenv';
import path from 'path';

// Load .env from workspace root
config({ path: path.join(process.cwd(), '../../.env') });

const EnvSchema = z.object({
  // ── App ─────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),

  // ── Clerk Auth ───────────────────────────────────────────────────────────
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),

  // ── Database (MongoDB) ───────────────────────────────────────────────────
  // Accepts: mongodb://... or mongodb+srv://...
  DATABASE_URL: z.string().refine(
    (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
    { message: 'DATABASE_URL must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)' },
  ),

  // ── Redis ────────────────────────────────────────────────────────────────
  // Dev:  redis://localhost:6379
  // Prod: rediss://default:TOKEN@HOST:PORT  (Upstash TLS endpoint)
  // Both work with ioredis — no code change needed between envs.
  REDIS_URL: z.string().url(),

  // ── CORS ─────────────────────────────────────────────────────────────────
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  SENTRY_DSN: z.string().optional(),

  // ── Logging ──────────────────────────────────────────────────────────────
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),

  // ── Frontend/Client ──────────────────────────────────────────────────────
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  // ── Razorpay ─────────────────────────────────────────────────────────────
  RAZORPAY_API_TEST_KEY: z.string().min(1),
  RAZORPAY_KEY_TEST_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RAZORPAY_PLAN_STARTER_ID: z.string().min(1),
  RAZORPAY_PLAN_GROWTH_ID: z.string().min(1),
  RAZORPAY_PLAN_SCALE_ID: z.string().min(1),
});

const _parsed = EnvSchema.safeParse(process.env);

if (!_parsed.success) {
  const issues = _parsed.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`\n❌ Invalid environment variables:\n${issues}\n`);
  process.exit(1);
}

export const env = _parsed.data;
export type Env = typeof env;
