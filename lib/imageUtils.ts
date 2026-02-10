/**
 * 全球化图片加载优化工具 (v2.1 - 深度本地化版)
 */

const GITHUB_USER = "lemonade1258";
const GITHUB_REPO = "lemonade1258.github.io";

// jsDelivr CDN 基础地址
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main/`;

export const optimizeImageUrl = (url: string): string => {
  if (!url) return "";

  // 1. Base64 图片直接返回
  if (url.startsWith("data:")) return url;

  // 2. 如果已经是本地资产路径 (./assets/...)
  if (url.startsWith("./assets/") || url.startsWith("assets/")) {
    const cleanPath = url.replace(/^\.\//, "");
    // 开发环境下（localhost）直接访问，生产环境下走 CDN
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      return `/${cleanPath}`;
    }
    return `${CDN_BASE}${cleanPath}`;
  }

  // 3. 处理 GitHub Raw 链接的回退（预防万一数据里还有残留）
  if (url.includes("raw.githubusercontent.com")) {
    const pathPart =
      url.split(`/${GITHUB_REPO}/main/`)[1] || url.split("/master/")[1];
    if (pathPart) return `${CDN_BASE}${pathPart}`;
  }

  // 4. 其他远程链接（如未被脚本处理的第三方链接），保持原样
  return url;
};

export const isGlobalMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return !navigator.language.includes("zh");
};
