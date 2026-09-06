import { hashPassword, verifyPassword, passwordSchema } from "../utils/password";

describe("password utils", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(await verifyPassword(hash, "Sup3rSecret!")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(await verifyPassword(hash, "WrongPassword1")).toBe(false);
  });

  it("produces a different hash for the same password each time (unique salt)", async () => {
    const [a, b] = await Promise.all([hashPassword("Sup3rSecret!"), hashPassword("Sup3rSecret!")]);
    expect(a).not.toEqual(b);
  });

  it("rejects passwords that are too short", () => {
    expect(passwordSchema.safeParse("Sh0rt").success).toBe(false);
  });

  it("rejects common passwords regardless of capitalization", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(false); // common password, just re-cased
    expect(passwordSchema.safeParse("password123").success).toBe(false); // no uppercase, also common
  });

  it("rejects passwords missing a required character class", () => {
    expect(passwordSchema.safeParse("alllowercase1").success).toBe(false); // no uppercase
  });

  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("MyStr0ngPassphrase").success).toBe(true);
  });
});
