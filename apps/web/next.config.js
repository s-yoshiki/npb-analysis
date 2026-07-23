import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  adapterPath: fileURLToPath(import.meta.resolve("cdk-nextjs/adapter")),
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const apiOrigin = process.env.NPB_API_ORIGIN ?? "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
