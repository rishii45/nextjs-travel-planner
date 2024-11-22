/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_DOMAIN: "http://localhost:3000",
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
      "pk_test_51QMX3s2Np9WuRWUaWveeT7Y8h0luhemJfknQOnEmnyNj7qDZi8ctBSBa5OhySfGjqiSyfcvSXL6SESObgetPFZyU000McO47XN",
  },
  images: {
    remotePatterns: [{ hostname: "imgcld.yatra.com" }],
  },
};

export default nextConfig;
