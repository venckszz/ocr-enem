import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1024).max(65535).default(4317),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(30).default(12),
  GOOGLE_API_KEY: z.string().min(10, 'GOOGLE_API_KEY não configurada.'),
  GOOGLE_OCR_MODEL: z.string().min(1).default('gemini-3.1-flash-lite'),
  GOOGLE_REFINER_MODEL: z.string().min(1).default('gemini-3.5-flash'),
  GOOGLE_OCR_REFINE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.88),
  GOOGLE_EVALUATION_MODEL: z.string().min(1).default('gemini-3.8-flash'),
  GOOGLE_EVALUATION_FALLBACK_MODEL: z.string().min(1).default('gemini-3.6-flash'),
  GOOGLE_EMBEDDING_MODEL: z.string().min(1).default('gemini-embedding-001'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Configuração inválida: ${message}`);
  }
  return parsed.data;
}
