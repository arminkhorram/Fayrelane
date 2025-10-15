/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable static export for Railway deployment
    output: 'export',
    trailingSlash: true,
    distDir: 'out',

    images: {
        // Use unoptimized images for static export
        unoptimized: true,
        domains: ['localhost', 'your-s3-bucket.s3.amazonaws.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.s3.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: '*.s3.*.amazonaws.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
}

module.exports = nextConfig





