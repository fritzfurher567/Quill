import { describe, expect, it } from "vitest";
import { parseRepository, parseSiteUrl } from "./repository";

describe("parseRepository", () => {
  it("accepts owner/name", () => {
    expect(parseRepository("octo/Quill")).toEqual({
      status: "ok",
      owner: "octo",
      name: "Quill",
      url: "https://github.com/octo/Quill",
      releasesUrl: "https://github.com/octo/Quill/releases",
    });
  });

  it("accepts a pasted github.com URL, with or without .git or a trailing slash", () => {
    for (const value of ["https://github.com/octo/Quill", "https://github.com/octo/Quill/", "https://github.com/octo/Quill.git"]) {
      expect(parseRepository(value)).toMatchObject({ status: "ok", owner: "octo", name: "Quill" });
    }
  });

  it("treats unset, empty and whitespace values as missing", () => {
    expect(parseRepository(undefined)).toEqual({ status: "missing" });
    expect(parseRepository("")).toEqual({ status: "missing" });
    expect(parseRepository("   ")).toEqual({ status: "missing" });
  });

  it("rejects malformed values instead of interpolating them", () => {
    for (const value of ["octo", "octo/Quill/extra", "octo/..", "../etc/passwd", "octo/Qu ill", "-octo/Quill", "octo/Quill?x=1", "http://evil.example/octo/Quill"]) {
      expect(parseRepository(value)).toEqual({ status: "invalid", value });
    }
  });
});

describe("parseSiteUrl", () => {
  it("returns the origin for a valid URL and null otherwise", () => {
    expect(parseSiteUrl("https://example.com/some/path")?.href).toBe("https://example.com/");
    expect(parseSiteUrl("")).toBeNull();
    expect(parseSiteUrl(undefined)).toBeNull();
    expect(parseSiteUrl("not a url")).toBeNull();
    expect(parseSiteUrl("javascript:alert(1)")).toBeNull();
  });
});
