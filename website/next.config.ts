import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // This site lives in a subfolder of the Quill app repository, which has its
  // own lockfile. Pin the workspace root so the build never picks the wrong one.
  turbopack: { root: process.cwd() },
  async redirects() {
    // The thanks page only exists for a specific file; without one, go and pick.
    return [{ source: "/download/thanks", destination: "/download", permanent: false }];
  },
  async headers() {
    return [
      {
        // Installers always download instead of opening in the browser. The manifest stays readable.
        source: "/downloads/:file(.+\\.(?:exe|dmg|AppImage|deb))",
        headers: [{ key: "Content-Disposition", value: "attachment" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
