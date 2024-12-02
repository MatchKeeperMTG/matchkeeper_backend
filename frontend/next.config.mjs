/** @type {import('next').NextConfig} */
const nextConfig = process.env.MKPR_ENV === "live" ? {} : {
    output: 'export',
    distDir: 'dist/',
    trailingSlash: true
};

export default nextConfig;