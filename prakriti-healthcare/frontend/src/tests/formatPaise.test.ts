import { describe, expect, it } from "vitest";
import { formatPaise } from "../api/types";

describe("formatPaise", () => {
  it("formats whole rupees without decimals", () => {
    expect(formatPaise(99900)).toBe("Rs. 999");
  });

  it("formats large amounts with Indian digit grouping", () => {
    expect(formatPaise(139900)).toBe("Rs. 1,399");
  });

  it("formats zero", () => {
    expect(formatPaise(0)).toBe("Rs. 0");
  });
});
