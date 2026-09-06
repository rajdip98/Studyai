import { signAccessToken, verifyAccessToken, generateRefreshToken, hashToken } from "../utils/tokens";

describe("token utils", () => {
  it("round-trips an access token", () => {
    const token = signAccessToken({ sub: "user-1", role: "CUSTOMER" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("CUSTOMER");
  });

  it("rejects a tampered access token", () => {
    const token = signAccessToken({ sub: "user-1", role: "CUSTOMER" });
    const tampered = token.slice(0, -2) + "xx";
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it("generates opaque refresh tokens whose hash is deterministic", () => {
    const { token, hash } = generateRefreshToken();
    expect(hashToken(token)).toBe(hash);
    expect(token).not.toEqual(hash);
  });

  it("generates unique refresh tokens on each call", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a.token).not.toEqual(b.token);
  });
});
