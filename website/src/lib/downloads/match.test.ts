import { describe, expect, it } from "vitest";
import { describeArch, describeFormat, matchFiles } from "./match";
import { parseManifest } from "./manifest";
import type { DownloadFile } from "./types";

type Entry = { platform: string; arch: string; file: string; variant?: string; recommended?: boolean };

function files(entries: Entry[]): DownloadFile[] {
  const result = parseManifest({ version: "1", files: entries });
  if (!result.ok || !result.downloads) throw new Error(result.ok ? "no files" : result.errors.join("\n"));
  return result.downloads.files;
}

const FULL = files([
  { platform: "windows", arch: "x64", file: "Quill-Setup-1.0.0.exe" },
  { platform: "windows", arch: "x64", file: "Quill-1.0.0-portable.exe", variant: "portable" },
  { platform: "macos", arch: "arm64", file: "Quill-1.0.0-arm64.dmg" },
  { platform: "macos", arch: "x64", file: "Quill-1.0.0.dmg" },
  { platform: "linux", arch: "x64", file: "Quill-1.0.0.AppImage" },
  { platform: "linux", arch: "arm64", file: "Quill-1.0.0-arm64.AppImage" },
  { platform: "linux", arch: "x64", file: "quill_1.0.0_amd64.deb" },
]);

const name = (file: DownloadFile | null) => file?.name ?? null;

describe("matchFiles: known CPU", () => {
  it("picks the file for the visitor's platform and CPU", () => {
    expect(name(matchFiles(FULL, "macos", "arm64").recommended)).toBe("Quill-1.0.0-arm64.dmg");
    expect(name(matchFiles(FULL, "macos", "x64").recommended)).toBe("Quill-1.0.0.dmg");
    expect(name(matchFiles(FULL, "linux", "arm64").recommended)).toBe("Quill-1.0.0-arm64.AppImage");
  });

  it("prefers the installer over the portable build, and AppImage over .deb", () => {
    expect(name(matchFiles(FULL, "windows", "x64").recommended)).toBe("Quill-Setup-1.0.0.exe");
    expect(name(matchFiles(FULL, "linux", "x64").recommended)).toBe("Quill-1.0.0.AppImage");
  });

  it("never recommends a build made for another CPU", () => {
    const onlyIntel = files([{ platform: "macos", arch: "x64", file: "Quill.dmg" }]);
    const match = matchFiles(onlyIntel, "macos", "arm64");
    expect(match.recommended).toBeNull();
    expect(match.files).toHaveLength(1); // still listed so the visitor can decide
  });

  it("accepts a universal build for any CPU, preferring an exact match", () => {
    const set = files([
      { platform: "macos", arch: "universal", file: "Quill-universal.dmg" },
      { platform: "macos", arch: "arm64", file: "Quill-arm64.dmg" },
    ]);
    expect(name(matchFiles(set, "macos", "arm64").recommended)).toBe("Quill-arm64.dmg");
    expect(name(matchFiles(set, "macos", "x64").recommended)).toBe("Quill-universal.dmg");
  });
});

describe("matchFiles: unknown CPU", () => {
  it("recommends the only choice when the platform has a single build", () => {
    expect(name(matchFiles(FULL, "windows", null).recommended)).toBe("Quill-Setup-1.0.0.exe");
  });

  it("does not guess between different CPUs, and lists everything", () => {
    const mac = matchFiles(FULL, "macos", null);
    expect(mac.recommended).toBeNull();
    expect(mac.files.map((file) => file.arch).sort()).toEqual(["arm64", "x64"]);
    expect(matchFiles(FULL, "linux", null).recommended).toBeNull();
  });

  it("recommends a universal build, which is safe on any CPU", () => {
    const set = files([
      { platform: "macos", arch: "arm64", file: "a-arm64.dmg" },
      { platform: "macos", arch: "universal", file: "a-universal.dmg" },
    ]);
    expect(name(matchFiles(set, "macos", null).recommended)).toBe("Quill-universal.dmg".replace("Quill", "a"));
  });
});

describe("matchFiles: the manifest's own pick", () => {
  const set = files([
    { platform: "linux", arch: "x64", file: "Quill.AppImage" },
    { platform: "linux", arch: "x64", file: "quill.deb", recommended: true },
  ]);

  it("wins over the default format order", () => {
    expect(name(matchFiles(set, "linux", "x64").recommended)).toBe("quill.deb");
    expect(name(matchFiles(set, "linux", null).recommended)).toBe("quill.deb");
  });

  it("does not make a CPU choice for the visitor", () => {
    const mixed = files([
      { platform: "macos", arch: "arm64", file: "a-arm64.dmg", recommended: true },
      { platform: "macos", arch: "x64", file: "a.dmg", recommended: true },
    ]);
    expect(matchFiles(mixed, "macos", null).recommended).toBeNull();
    expect(name(matchFiles(mixed, "macos", "x64").recommended)).toBe("a.dmg");
  });
});

describe("matchFiles: ordering and empty platforms", () => {
  it("puts the recommendation first, then installers before portable builds", () => {
    const match = matchFiles(FULL, "windows", "x64");
    expect(match.files.map((file) => file.name)).toEqual(["Quill-Setup-1.0.0.exe", "Quill-1.0.0-portable.exe"]);
  });

  it("returns nothing for a platform with no files", () => {
    const windowsOnly = files([{ platform: "windows", arch: "x64", file: "a.exe" }]);
    expect(matchFiles(windowsOnly, "linux", "x64")).toEqual({ platform: "linux", recommended: null, files: [] });
  });

  it("describes formats and CPUs for people", () => {
    const [setup, portable, armDmg, intelDmg] = FULL;
    expect(describeFormat(setup!)).toBe("Installer (.exe)");
    expect(describeFormat(portable!)).toBe("Portable (.exe)");
    expect(describeArch(armDmg!)).toBe("Apple silicon (arm64)");
    expect(describeArch(intelDmg!)).toBe("Intel (x64)");
  });
});
