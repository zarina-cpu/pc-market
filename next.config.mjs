import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/prisma/*.db",
          "**/prisma/*.db-*",
          "**/data/**",
          "**/AGENTS.md",
        ],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
