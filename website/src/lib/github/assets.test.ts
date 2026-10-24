import { describe, expect, it } from "vitest";
import { classifyAsset, matchAssets } from "./assets";
import { asset, FULL_ASSET_SET, OWNER, REPO } from "./fixtures";
import type { ReleaseAsset } from "./types";

const repository = { owner: OWNER, name: REPO };

function classifyAll(raw = FULL_ASSET_SET): ReleaseAsset[] {
  return raw.map((entry) => classifyAsset(entry, repository)).filter((entry): entry is ReleaseAsset => entry !== null);
}

describe("classifyAsset", () => {
  it("keeps installers and drops checksums, blockmaps, manifests and zip archives", () => {
    const names = classifyAll().map((entry) => entry.name);
    expect(names).toEqual([
      "Quill-Setup-1.5.0.exe",
      "Quill-1.5.0-portable.exe",
      "Quill-1.5.0.dmg",
      "Quill-1.5.0-arm64.dmg",
      "Quill-1.5.0.AppImage",
      "Quill-1.5.0-arm64.AppImage",
      "quill_1.5.0_amd64.deb",
    ]);
  });

  it("reads platform, format, variant and architecture from the filename", () => {
    const byName = Object.fromEntries(classifyAll().map((entry) => [entry.name, entry]));
    expect(byName["Quill-Setup-1.5.0.exe"]).toMatchObject({ platform: "windows", format: "exe", variant: "installer", arch: null });
    expect(byName["Quill-1.5.0-portable.exe"]).toMatchObject({ platform: "windows", variant: "portable" });
    expect(byName["Quill-1.5.0-arm64.dmg"]).toMatchObject({ platform: "macos", format: "dmg", arch: "arm64" });
    expect(byName["Quill-1.5.0.AppImage"]).toMatchObject({ platform: "linux", format: "appimage", arch: null });
    expect(byName["quill_1.5.0_amd64.deb"]).toMatchObject({ platform: "linux", format: "deb", arch: "x64" });
  });

  it("recognises x86_64, aarch64 and universal tags", () => {
    expect(classifyAsset(asset("Quill-1.0.0-x86_64.AppImage"), repository)?.arch).toBe("x64");
    expect(classifyAsset(asset("Quill-1.0.0-aarch64.AppImage"), repository)?.arch).toBe("arm64");
    expect(classifyAsset(asset("Quill-1.0.0-universal.dmg"), repository)?.arch).toBe("universal");
  });

  it("does not offer 32-bit builds", () => {
    expect(classifyAsset(asset("Quill-Setup-1.0.0-ia32.exe"), repository)).toBeNull();
    expect(classifyAsset(asset("Quill-1.0.0-x86.exe"), repository)).toBeNull();
  });

  it("rejects assets that are not fully uploaded", () => {
    expect(classifyAsset(asset("Quill-Setup-1.5.0.exe", 1, { state: "open" }), repository)).toBeNull();
  });

  it("rejects download URLs that do not point into this repository's releases", () => {
    const foreign = asset("Quill-Setup-1.5.0.exe", 1, { browser_download_url: "https://evil.example/Quill-Setup-1.5.0.exe" });
    const otherRepo = asset("Quill-Setup-1.5.0.exe", 1, { browser_download_url: "https://github.com/someone/else/releases/download/v1/Quill-Setup-1.5.0.exe" });
    const http = asset("Quill-Setup-1.5.0.exe", 1, { browser_download_url: `http://github.com/${OWNER}/${REPO}/releases/download/v1/x.exe` });
    expect(classifyAsset(foreign, repository)).toBeNull();
    expect(classifyAsset(otherRepo, repository)).toBeNull();
    expect(classifyAsset(http, repository)).toBeNull();
  });

  it("keeps the exact URL GitHub returned", () => {
    const raw = asset("Quill-Setup-1.5.0.exe");
    expect(classifyAsset(raw, repository)?.url).toBe(raw.browser_download_url);
  });

  it("reports a missing size as null rather than inventing one", () => {
    expect(classifyAsset(asset("Quill-Setup-1.5.0.exe", 0, { size: undefined }), repository)?.size).toBeNull();
  });
});

describe("matchAssets", () => {
  const assets = classifyAll();

  it("recommends the single Windows installer and lists the portable build as an alternative", () => {
    const match = matchAssets(assets, "windows", null);
    expect(match.recommended?.name).toBe("Quill-Setup-1.5.0.exe");
    expect(match.assets.map((entry) => entry.name)).toEqual(["Quill-Setup-1.5.0.exe", "Quill-1.5.0-portable.exe"]);
  });

  it("recommends the matching macOS build when the CPU is known", () => {
    expect(matchAssets(assets, "macos", "arm64").recommended?.name).toBe("Quill-1.5.0-arm64.dmg");
    // The untagged file is the only candidate that is not named for another CPU.
    expect(matchAssets(assets, "macos", "x64").recommended?.name).toBe("Quill-1.5.0.dmg");
  });

  it("does not guess between several macOS builds when the CPU is unknown", () => {
    const match = matchAssets(assets, "macos", null);
    expect(match.recommended).toBeNull();
    expect(match.assets).toHaveLength(2);
  });

  it("prefers the AppImage over the .deb and matches architecture on Linux", () => {
    expect(matchAssets(assets, "linux", "arm64").recommended?.name).toBe("Quill-1.5.0-arm64.AppImage");
    const x64 = matchAssets(assets, "linux", "x64");
    expect(x64.recommended?.name).toBe("Quill-1.5.0.AppImage");
    expect(x64.assets.map((entry) => entry.format)).toContain("deb");
  });

  it("recommends a lone .deb when it is the only Linux package", () => {
    const onlyDeb = classifyAll([asset("quill_1.5.0_amd64.deb")]);
    expect(matchAssets(onlyDeb, "linux", null).recommended?.format).toBe("deb");
  });

  it("recommends nothing when the only build is named for a different CPU", () => {
    const onlyIntel = classifyAll([asset("Quill-1.5.0-x64.dmg")]);
    const match = matchAssets(onlyIntel, "macos", "arm64");
    expect(match.recommended).toBeNull();
    expect(match.assets).toHaveLength(1); // still listed so the visitor can decide
  });

  it("returns nothing for a platform with no installers", () => {
    const windowsOnly = classifyAll([asset("Quill-Setup-1.5.0.exe")]);
    expect(matchAssets(windowsOnly, "linux", "x64")).toEqual({ platform: "linux", recommended: null, assets: [] });
  });
});
