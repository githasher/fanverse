import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  /**
   * Content-Security-Policy:
   * - 'unsafe-eval' is required by Next.js in development (Fast Refresh) and by certain hydration operations in Framer Motion.
   * - 'unsafe-inline' is required for Tailwind CSS style insertions and initial server-side hydration scripts.
   * - maps.googleapis.com and generativeai.googleapis.com are added for third-party integrations (Maps, client-side direct calls if any).
   */
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' maps.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: maps.gstatic.com *.googleapis.com; font-src 'self' fonts.gstatic.com; connect-src 'self' generativeai.googleapis.com maps.googleapis.com;" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
