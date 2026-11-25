import type { NextConfig } from "next";

const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/p/:path*", headers: privateHeaders },
      { source: "/contoh/:path*", headers: privateHeaders },
    ];
  },
};

export default nextConfig;
