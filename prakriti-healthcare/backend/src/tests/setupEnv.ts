// Ensures the zod-validated env schema (src/config/env.ts) has safe
// placeholder values when running unit tests that don't set a full .env.
process.env.NODE_ENV = "test";
process.env.CORS_ORIGINS ??= "http://localhost:5173";
process.env.DATABASE_URL ??= "postgresql://prakriti:prakriti@localhost:5432/prakriti_healthcare_test";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-please-change-0123456789";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-please-change-0123456789";
process.env.COOKIE_SECRET ??= "test-cookie-secret-please-change-0123456789";
