/**
 * 全球化图片加载优化工具
 * 逻辑：如果图片路径是相对路径 (./assets/...)，则自动映射到 GitHub 的 Raw CDN
 */

// 请确保这里的仓库名与你的 GitHub 实际仓库名一致
const GITHUB_USER = "author0001";
const GITHUB_REPO = "WHU-NextGen.github-io";
const GLOBAL_CDN_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/`;

export const optimizeImageUrl = (url: string): string => {
  if (!url) return "";

  // 如果是相对路径，自动拼接 GitHub 仓库地址作为全球加速路径
  if (url.startsWith("./")) {
    const cleanPath = url.replace(/^\.\//, "");
    return `${GLOBAL_CDN_BASE}${cleanPath}`;
  }

  if (url.startsWith("assets/")) {
    return `${GLOBAL_CDN_BASE}${url}`;
  }

  return url;
};

export const isGlobalMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return !navigator.language.includes("zh");
};
