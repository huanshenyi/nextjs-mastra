import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@mastra/*"],
  env: {
    REGION: process.env.REGION,
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    SESSION_TOKEN: process.env.SESSION_TOKEN,
    PUBLICK_KEY: process.env.PUBLICK_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    BASE_URL: process.env.BASE_URL,
  },
  output: "standalone",
};

export default nextConfig;
