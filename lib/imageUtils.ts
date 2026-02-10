/**
 * 全球化图片加载优化工具 (v2.4 - 容错增强版)
 */

const GITHUB_USER = "lemonade1258";
const GITHUB_REPO = "lemonade1258.github.io";

const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main/`;

const getOriginBase = () => {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  // 处理 lemonade1258.github.io 可能存在的路径偏移
  return origin.endsWith("/") ? origin : `${origin}/`;
};

export const optimizeImageUrl = (url: string, useOrigin = false): string => {
  if (!url) return "";

  // 清洗 URL：剔除末尾可能存在的反斜杠或引号 (针对脚本可能产生的污染)
  let cleanUrl = url.trim().replace(/[\\"'，]+$/, "");

  // 1. Base64
  if (cleanUrl.startsWith("data:")) return cleanUrl;

  // 2. 处理本地资产
  if (cleanUrl.startsWith("./assets/") || cleanUrl.startsWith("assets/")) {
    const path = cleanUrl.replace(/^\.\//, "");

    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      return `/${path}`;
    }

    if (useOrigin) {
      return `${getOriginBase()}${path}`;
    }
    return `${CDN_BASE}${path}`;
  }

  return cleanUrl;
};

export const isGlobalMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return !navigator.language.includes("zh");
};
