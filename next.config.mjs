import withPWAInit from '@ducanh2912/next-pwa';

const isExport = process.env.NEXT_EXPORT === 'true';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isExport && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default withPWA(nextConfig);
