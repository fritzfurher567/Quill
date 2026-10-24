import { describe, expect, it } from "vitest";
import { formatBytes, formatReleaseDate } from "./format";

describe("formatBytes", () => {
  it("formats sizes compactly and drops needless decimals", () => {
    expect(formatBytes(91_000_000)).toBe("91 MB");
    expect(formatBytes(115_500_000)).toBe("116 MB");
    expect(formatBytes(1_250_000)).toBe("1.3 MB");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2_300_000_000)).toBe("2.3 GB");
  });

  it("returns null instead of inventing a size", () => {
    expect(formatBytes(null)).toBeNull();
    expect(formatBytes(0)).toBeNull();
    expect(formatBytes(Number.NaN)).toBeNull();
  });
});

describe("formatReleaseDate", () => {
  it("formats in UTC so server and browser agree", () => {
    expect(formatReleaseDate("2026-10-01T23:59:00Z")).toBe("October 1, 2026");
  });
  it("returns null for missing or invalid dates", () => {
    expect(formatReleaseDate(null)).toBeNull();
    expect(formatReleaseDate("not a date")).toBeNull();
  });
});
