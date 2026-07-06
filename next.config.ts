import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages 배포 시 레포지토리명을 기준으로 서브디렉토리 경로를 매핑합니다.
  basePath: isGithubPages ? "/cardnews-template-system" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
