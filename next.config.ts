import type { NextConfig } from 'next';

// Static export: the whole exhibition is plain files, deployable to any static host
// (Cloudflare Workers static assets — see wrangler.jsonc).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
