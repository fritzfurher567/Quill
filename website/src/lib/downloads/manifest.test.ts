import { describe, expect, it } from "vitest";
import { parseManifest } from "./manifest";

const valid = {
  version: "v1.0.0",
  releasedAt: "2026-10-25",
  notesUrl: "https://example.com/notes",
  files: [
    { platform: "windows", arch: "x64", file: "Quill-Setup-1.0.0.exe" },
    { platform: "windows", arch: "x64", file: "Quill-1.0.0-portable.exe", variant: "portable" },
    { platform: "macos", arch: "arm64", file: "Quill-1.0.0-arm64.dmg", size: 115_000_000 },
    { platform: "macos", arch: "x64", url: "https://github.com/o/r/releases/download/v1.0.0/Quill-1.0.0.dmg", recommended: true },
    { platform: "linux", arch: "x64", file: "Quill-1.0.0.AppImage", sha256: "A".repeat(64) },
    { platform: "linux", arch: "x64", file: "quill_1.0.0_amd64.deb" },
  ],
};

function errorsFor(manifest: unknown): string[] {
  const result = parseManifest(manifest);
  if (result.ok) throw new Error("expected the manifest to be rejected");
  return result.errors;
}

describe("parseManifest: valid manifests", () => {
  it("parses a full manifest, deriving format, id and URLs", () => {
    const result = parseManifest(valid);
    expect(result.ok).toBe(true);
    if (!result.ok || !result.downloads) return;
    const { downloads } = result;
    expect(downloads).toMatchObject({ version: "1.0.0", releasedAt: "2026-10-25", notesUrl: "https://example.com/notes" });
    expect(downloads.files).toHaveLength(6);

    const [setup, portable, armDmg, intelDmg, appImage, deb] = downloads.files;
    expect(setup).toMatchObject({ id: "windows-x64-installer-exe", format: "exe", variant: "installer", url: "/downloads/Quill-Setup-1.0.0.exe", external: false, size: null });
    expect(portable).toMatchObject({ id: "windows-x64-portable-exe", variant: "portable" });
    expect(armDmg).toMatchObject({ format: "dmg", size: 115_000_000 });
    expect(intelDmg).toMatchObject({ external: true, name: "Quill-1.0.0.dmg", url: "https://github.com/o/r/releases/download/v1.0.0/Quill-1.0.0.dmg", recommended: true });
    expect(appImage).toMatchObject({ format: "appimage", sha256: "a".repeat(64) });
    expect(deb).toMatchObject({ format: "deb" });
  });

  it("treats an empty file list as 'nothing published yet'", () => {
    expect(parseManifest({ files: [] })).toEqual({ ok: true, downloads: null });
  });

  it("URL-encodes file names with spaces", () => {
    const result = parseManifest({ version: "1", files: [{ platform: "windows", arch: "x64", file: "Quill Setup 1.0.exe" }] });
    expect(result.ok && result.downloads?.files[0]?.url).toBe("/downloads/Quill%20Setup%201.0.exe");
  });

  it("decodes the file name from an external URL", () => {
    const result = parseManifest({ version: "1", files: [{ platform: "windows", arch: "x64", url: "https://host.example/dl/Quill%20Setup.exe?token=1" }] });
    expect(result.ok && result.downloads?.files[0]?.name).toBe("Quill Setup.exe");
  });
});

describe("parseManifest: rejects mistakes", () => {
  it("rejects non-objects and a missing files list", () => {
    expect(errorsFor(null)[0]).toMatch(/JSON object/);
    expect(errorsFor([])[0]).toMatch(/JSON object/);
    expect(errorsFor({ version: "1" })[0]).toMatch(/"files" must be a list/);
  });

  it("requires a version once files are listed", () => {
    expect(errorsFor({ files: valid.files })).toEqual(['"version" is required (for example "1.0.0") when files are listed.']);
  });

  it("reports unknown keys, which are usually typos", () => {
    expect(errorsFor({ ...valid, verison: "1" }).join()).toMatch(/Unknown top-level key "verison"/);
    expect(errorsFor({ version: "1", files: [{ platfrom: "windows", platform: "windows", arch: "x64", file: "a.exe" }] }).join()).toMatch(/unknown key "platfrom"/);
  });

  it("validates platform, arch and variant", () => {
    const errors = errorsFor({ version: "1", files: [{ platform: "win", arch: "x86", file: "a.exe", variant: "zip" }] }).join("\n");
    expect(errors).toMatch(/"platform" must be one of windows, macos, linux, got "win"/);
    expect(errors).toMatch(/"arch" must be one of x64, arm64, universal, got "x86"/);
    expect(errors).toMatch(/"variant" must be installer or portable/);
  });

  it("requires exactly one of file or url", () => {
    expect(errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64" }] }).join()).toMatch(/exactly one of "file"/);
    expect(errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64", file: "a.exe", url: "https://x.example/a.exe" }] }).join()).toMatch(/exactly one of "file"/);
  });

  it("refuses paths in file names (no folders, no traversal)", () => {
    for (const file of ["../secret.exe", "sub/a.exe", "..\\a.exe", ".hidden.exe", "a/../b.exe", "/etc/passwd.exe"]) {
      expect(errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64", file }] }).join(), file).toMatch(/plain file name/);
    }
  });

  it("only accepts https URLs", () => {
    for (const url of ["http://x.example/a.exe", "ftp://x.example/a.exe", "javascript:alert(1)", "not a url", "/downloads/a.exe"]) {
      expect(errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64", url }] }).join(), url).toMatch(/"url" must be an https/);
    }
    expect(errorsFor({ ...valid, notesUrl: "http://x.example" }).join()).toMatch(/"notesUrl" must be an https/);
  });

  it("rejects unknown formats and files that don't belong to the platform", () => {
    expect(errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64", file: "Quill.zip" }] }).join()).toMatch(/can't tell the format of "Quill.zip"/);
    expect(errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64", file: "Quill.dmg" }] }).join()).toMatch(/.dmg file, which doesn't belong to platform "windows"/);
    expect(errorsFor({ version: "1", files: [{ platform: "linux", arch: "x64", file: "Quill.exe" }] }).join()).toMatch(/doesn't belong to platform "linux"/);
  });

  it("validates optional fields", () => {
    const base = { platform: "windows", arch: "x64", file: "a.exe" };
    expect(errorsFor({ version: "1", files: [{ ...base, size: -5 }] }).join()).toMatch(/"size"/);
    expect(errorsFor({ version: "1", files: [{ ...base, size: 1.5 }] }).join()).toMatch(/"size"/);
    expect(errorsFor({ version: "1", files: [{ ...base, sha256: "abc" }] }).join()).toMatch(/"sha256"/);
    expect(errorsFor({ version: "1", files: [{ ...base, recommended: "yes" }] }).join()).toMatch(/"recommended"/);
    expect(errorsFor({ ...valid, releasedAt: "soon" }).join()).toMatch(/"releasedAt"/);
  });

  it("rejects duplicates of the same platform, arch, variant and format", () => {
    const errors = errorsFor({ version: "1", files: [{ platform: "windows", arch: "x64", file: "a.exe" }, { platform: "windows", arch: "x64", file: "b.exe" }] });
    expect(errors.join()).toMatch(/files\[1\]: duplicates files\[0\]/);
  });

  it("rejects two 'recommended' files for the same platform and CPU", () => {
    const errors = errorsFor({
      version: "1",
      files: [
        { platform: "linux", arch: "x64", file: "a.AppImage", recommended: true },
        { platform: "linux", arch: "x64", file: "a.deb", recommended: true },
      ],
    });
    expect(errors.join()).toMatch(/More than one file is marked "recommended" for linux x64/);
  });

  it("reports every problem at once, with the entry it belongs to", () => {
    const errors = errorsFor({ version: "1", files: [{ platform: "x", arch: "x64", file: "a.exe" }, { platform: "windows", arch: "y", file: "b.exe" }] });
    expect(errors.some((message) => message.startsWith("files[0]:"))).toBe(true);
    expect(errors.some((message) => message.startsWith("files[1]:"))).toBe(true);
  });
});
