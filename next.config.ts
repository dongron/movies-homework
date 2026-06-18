import type { NextConfig } from 'next';

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
        ],
    },
};

export default nextConfig;
