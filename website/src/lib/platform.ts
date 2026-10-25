/**
 * Client-side platform detection.
 *
 * Browser detection is a best guess, never a fact, so the result carries only
 * what could be established and the UI always offers a manual choice:
 * - The operating system comes from `navigator.userAgentData` where the browser
 *   has it, otherwise from the user-agent string.
 * - The CPU architecture is only reported when it is reliable. Windows and macOS
 *   user-agent strings do not reveal it (an Apple-silicon Mac still says "Intel"),
 *   so there it stays `null` unless the Client Hints API answers.
 */

import type { Arch, PlatformId } from "@/lib/downloads/types";

export interface NavigatorLike {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  userAgentData?: {
    platform?: string;
    mobile?: boolean;
    getHighEntropyValues?: (hints: string[]) => Promise<{
      architecture?: string;
      bitness?: string;
      platform?: string;
    }>;
  };
}

export interface Detection {
  /** The likely desktop platform, or null for phones, tablets and unknowns. */
  platform: PlatformId | null;
  /** Only set when reliably known. */
  arch: Arch | null;
  /** True on phones and tablets, where a desktop installer is not useful. */
  mobile: boolean;
}

export function detectPlatform(nav: NavigatorLike): Detection {
  const ua = nav.userAgent ?? "";
  const hintPlatform = nav.userAgentData?.platform ?? "";

  // iPadOS reports itself as a Mac but has a touch screen.
  const iPadOS = /Macintosh/i.test(ua) && (nav.maxTouchPoints ?? 0) > 1;
  const mobile =
    nav.userAgentData?.mobile === true ||
    iPadOS ||
    /android|iphone|ipad|ipod|mobile/i.test(ua) ||
    /^(android|ios)$/i.test(hintPlatform);

  if (mobile) return { platform: null, arch: null, mobile: true };

  let platform: PlatformId | null = null;
  if (hintPlatform) {
    if (/^windows$/i.test(hintPlatform)) platform = "windows";
    else if (/^macos$/i.test(hintPlatform)) platform = "macos";
    else if (/^linux$/i.test(hintPlatform)) platform = "linux";
  }
  if (!platform) {
    if (/windows/i.test(ua)) platform = "windows";
    else if (/mac os x|macintosh/i.test(ua)) platform = "macos";
    else if (/cros/i.test(ua)) platform = null; // ChromeOS: no desktop installer
    else if (/linux|x11|ubuntu|fedora|debian/i.test(ua)) platform = "linux";
  }

  // Only Linux user-agent strings state the CPU honestly.
  let arch: Arch | null = null;
  if (platform === "linux") {
    if (/aarch64|arm64/i.test(ua)) arch = "arm64";
    else if (/x86_64|amd64|x64/i.test(ua)) arch = "x64";
  }

  return { platform, arch, mobile: false };
}

/**
 * Asks the Client Hints API for the CPU architecture (Chromium-based browsers).
 * Resolves to the unchanged detection when the browser does not support it.
 */
export async function refineArchitecture(nav: NavigatorLike, detection: Detection): Promise<Detection> {
  const getValues = nav.userAgentData?.getHighEntropyValues;
  if (detection.mobile || typeof getValues !== "function") return detection;

  try {
    const values = await getValues.call(nav.userAgentData, ["architecture", "bitness"]);
    const is64 = values.bitness === "64";
    if (values.architecture === "arm" && is64) return { ...detection, arch: "arm64" };
    if (values.architecture === "x86" && is64) return { ...detection, arch: "x64" };
  } catch {
    // The hint was refused or unsupported; keep the best guess we already had.
  }
  return detection;
}
