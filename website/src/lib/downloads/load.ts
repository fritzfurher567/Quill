/**
 * Server-side loading of public/downloads/manifest.json.
 *
 * This runs while the site is being built, so mistakes surface as a failed
 * build (and the previous deployment stays live) rather than as a broken
 * download for a visitor. It checks that every file the manifest names as
 * hosted with the site actually exists, and fills in its size.
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parseManifest } from "./manifest";
import type { DownloadFile, DownloadsResult } from "./types";

/**
 * Read only at build time (every page that calls this is fully static, with no
 * `revalidate`), so the bundler is told not to trace the folder into the server
 * output. Otherwise the installers themselves would be copied into it.
 */
export const DOWNLOADS_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "downloads");
export const MANIFEST_FILE = "manifest.json";

export async function loadDownloads(dir: string = DOWNLOADS_DIR): Promise<DownloadsResult> {
  const manifestPath = path.join(/*turbopackIgnore: true*/ dir, MANIFEST_FILE);

  let text: string;
  try {
    text = await readFile(manifestPath, "utf8");
  } catch (error) {
    // No manifest at all just means nothing has been published yet.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { status: "empty" };
    throw error;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`public/downloads/${MANIFEST_FILE} is not valid JSON: ${(error as Error).message}`);
  }

  const parsed = parseManifest(json);
  if (!parsed.ok) {
    throw new Error(`public/downloads/${MANIFEST_FILE} has problems:\n${parsed.errors.map((message) => `  - ${message}`).join("\n")}`);
  }
  if (!parsed.downloads) return { status: "empty" };

  // Every locally hosted file must exist; its real size fills in a missing one.
  const missing: string[] = [];
  const files: DownloadFile[] = await Promise.all(
    parsed.downloads.files.map(async (file) => {
      if (file.external) return file;
      try {
        const info = await stat(path.join(/*turbopackIgnore: true*/ dir, file.name));
        if (!info.isFile()) throw new Error("not a file");
        return { ...file, size: file.size ?? info.size };
      } catch {
        missing.push(file.name);
        return file;
      }
    }),
  );
  if (missing.length > 0) {
    throw new Error(
      `public/downloads/${MANIFEST_FILE} lists file(s) that aren't in public/downloads: ${missing.join(", ")}.\n` +
        '  Upload them there, or use "url" instead of "file" for files hosted elsewhere.',
    );
  }

  return { status: "ready", downloads: { ...parsed.downloads, files } };
}
