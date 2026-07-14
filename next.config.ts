import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubPagesBasePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: githubPagesBasePath || undefined,
  assetPrefix: githubPagesBasePath || undefined
};

export default nextConfig;
