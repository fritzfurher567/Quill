import { describe, expect, it } from "vitest";
import { detectPlatform, refineArchitecture, type NavigatorLike } from "./platform";

const UA = {
  windowsChrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  linuxX64: "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
  linuxArm: "Mozilla/5.0 (X11; Linux aarch64; rv:130.0) Gecko/20100101 Firefox/130.0",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  chromeOS: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
};

describe("detectPlatform", () => {
  it("detects desktop platforms from the user agent", () => {
    expect(detectPlatform({ userAgent: UA.windowsChrome })).toEqual({ platform: "windows", arch: null, mobile: false });
    expect(detectPlatform({ userAgent: UA.macSafari })).toEqual({ platform: "macos", arch: null, mobile: false });
    expect(detectPlatform({ userAgent: UA.linuxX64 })).toEqual({ platform: "linux", arch: "x64", mobile: false });
    expect(detectPlatform({ userAgent: UA.linuxArm })).toEqual({ platform: "linux", arch: "arm64", mobile: false });
  });

  it("never claims an architecture the user agent cannot reveal (Windows, macOS)", () => {
    expect(detectPlatform({ userAgent: UA.windowsChrome }).arch).toBeNull();
    expect(detectPlatform({ userAgent: UA.macSafari }).arch).toBeNull();
  });

  it("prefers userAgentData when present", () => {
    expect(detectPlatform({ userAgent: "", userAgentData: { platform: "macOS", mobile: false } }).platform).toBe("macos");
    expect(detectPlatform({ userAgent: "", userAgentData: { platform: "Windows" } }).platform).toBe("windows");
    expect(detectPlatform({ userAgent: "", userAgentData: { platform: "Linux" } }).platform).toBe("linux");
  });

  it("treats phones and tablets as mobile with no desktop platform", () => {
    expect(detectPlatform({ userAgent: UA.android })).toEqual({ platform: null, arch: null, mobile: true });
    expect(detectPlatform({ userAgent: UA.iphone })).toEqual({ platform: null, arch: null, mobile: true });
    // iPadOS pretends to be a Mac but has a touch screen.
    expect(detectPlatform({ userAgent: UA.macSafari, maxTouchPoints: 5 }).mobile).toBe(true);
    expect(detectPlatform({ userAgent: "", userAgentData: { platform: "Android", mobile: true } }).mobile).toBe(true);
  });

  it("does not offer a desktop platform on ChromeOS or unknown systems", () => {
    expect(detectPlatform({ userAgent: UA.chromeOS }).platform).toBeNull();
    expect(detectPlatform({ userAgent: "SomethingElse/1.0" }).platform).toBeNull();
    expect(detectPlatform({})).toEqual({ platform: null, arch: null, mobile: false });
  });
});

describe("refineArchitecture", () => {
  const mac = detectPlatform({ userAgent: UA.macSafari });

  function withHints(values: { architecture?: string; bitness?: string } | Error): NavigatorLike {
    return {
      userAgent: UA.macSafari,
      userAgentData: {
        platform: "macOS",
        getHighEntropyValues: async () => {
          if (values instanceof Error) throw values;
          return values;
        },
      },
    };
  }

  it("reads arm64 and x64 from Client Hints", async () => {
    expect((await refineArchitecture(withHints({ architecture: "arm", bitness: "64" }), mac)).arch).toBe("arm64");
    expect((await refineArchitecture(withHints({ architecture: "x86", bitness: "64" }), mac)).arch).toBe("x64");
  });

  it("keeps the original detection when hints are unsupported, refused or unclear", async () => {
    expect(await refineArchitecture({ userAgent: UA.macSafari }, mac)).toBe(mac);
    expect(await refineArchitecture(withHints(new Error("NotAllowedError")), mac)).toBe(mac);
    expect(await refineArchitecture(withHints({ architecture: "x86", bitness: "32" }), mac)).toBe(mac);
  });

  it("does not bother on mobile", async () => {
    const mobile = detectPlatform({ userAgent: UA.android });
    expect(await refineArchitecture(withHints({ architecture: "arm", bitness: "64" }), mobile)).toBe(mobile);
  });
});
