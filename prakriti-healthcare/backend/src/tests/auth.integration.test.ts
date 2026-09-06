/**
 * Integration tests exercising the real HTTP + database stack. These require
 * a Postgres + Redis instance (see docker-compose.yml, or CI service
 * containers in .github/workflows/ci.yml) and a migrated test database:
 *
 *   DATABASE_URL=postgresql://.../prakriti_healthcare_test npx prisma migrate deploy
 *   npm test
 *
 * They are skipped automatically when INTEGRATION=1 is not set, so `npm test`
 * stays fast and dependency-free by default (see password.test.ts / tokens.test.ts).
 */
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/prisma";

const describeIntegration = process.env.INTEGRATION === "1" ? describe : describe.skip;

describeIntegration("auth flow", () => {
  const app = createApp();
  const email = `test.${Date.now()}@example.com`;
  const password = "Str0ngPassphrase!";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test User", email, password });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test User", email, password });
    expect(res.status).toBe(409);
  });

  it("rejects login with a wrong password without revealing whether the account exists", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password: "WrongPassword1" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("logs in with correct credentials and sets httpOnly cookies", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("access_token=") && c.includes("HttpOnly"))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refresh_token=") && c.includes("HttpOnly"))).toBe(true);
  });

  it("blocks unauthenticated access to /api/users/me", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
});
