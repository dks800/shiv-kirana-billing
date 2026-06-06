import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.31.27"],
  output: "export",
  trailingSlash: true,
};

export default nextConfig;