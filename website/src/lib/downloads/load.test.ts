import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDownloads } from "./load";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "quill-downloads-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const write = (name: string, content: string) => writeFile(path.join(dir, name), content);

describe("loadDownloads", () => {
  it("is empty when there is no manifest or it lists nothing", async () => {
    expect(await loadDownloads(dir)).toEqual({ status: "empty" });
    await write("manifest.json", JSON.stringify({ files: [] }));
    expect(await loadDownloads(dir)).toEqual({ status: "empty" });
  });

  it("fills in real file sizes for locally hosted files and keeps an explicit size", async () => {
    await write("Quill-Setup-1.0.0.exe", "x".repeat(1234));
    await write("Quill-1.0.0.dmg", "y".repeat(10));
    await write(
      "manifest.json",
      JSON.stringify({
        version: "1.0.0",
        files: [
          { platform: "windows", arch: "x64", file: "Quill-Setup-1.0.0.exe" },
          { platform: "macos", arch: "x64", file: "Quill-1.0.0.dmg", size: 999 },
          { platform: "linux", arch: "x64", url: "https://host.example/Quill.AppImage" },
        ],
      }),
    );
    const result = await loadDownloads(dir);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.downloads.files.map((file) => file.size)).toEqual([1234, 999, null]);
  });

  it("fails loudly when a listed file is missing, naming it", async () => {
    await write("manifest.json", JSON.stringify({ version: "1", files: [{ platform: "windows", arch: "x64", file: "Missing.exe" }] }));
    await expect(loadDownloads(dir)).rejects.toThrow(/aren't in public\/downloads: Missing\.exe/);
  });

  it("fails loudly on invalid JSON and on an invalid manifest", async () => {
    await write("manifest.json", "{ nope");
    await expect(loadDownloads(dir)).rejects.toThrow(/not valid JSON/);
    await write("manifest.json", JSON.stringify({ version: "1", files: [{ platform: "beos", arch: "x64", file: "a.exe" }] }));
    await expect(loadDownloads(dir)).rejects.toThrow(/has problems:[\s\S]*"platform" must be one of/);
  });
});
