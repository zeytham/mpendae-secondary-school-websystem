import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dkfrcavun/**', // badilisha 'dkfrcavun' na cloud name yako halisi kama ni tofauti
      },
    ],
  },
};

export default nextConfig;