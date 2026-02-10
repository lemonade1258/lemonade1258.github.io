/**
 * 全球化图片加载优化工具 (v2.0 - jsDelivr 加速版)
 * 逻辑：将 GitHub 仓库中的图片通过 jsDelivr CDN 进行全球加速
 */

const GITHUB_USER = "lemonade1258";
const GITHUB_REPO = "lemonade1258.github.io";

// 使用 jsDelivr 的加速地址格式：https://cdn.jsdelivr.net/gh/user/repo@branch/file
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main/`;

export const optimizeImageUrl = (url: string): string => {
  if (!url) return "";

  // 1. 如果是 Base64 直接返回
  if (url.startsWith("data:")) return url;

  // 2. 如果是外部完整链接 (http/https) 且不是来自 github 的原始链接，直接返回
  if (url.startsWith("http") && !url.includes("raw.githubusercontent.com")) {
    return url;
  }

  // 3. 处理 GitHub 原始链接，强制转为 jsDelivr 加速链接
  if (url.includes("raw.githubusercontent.com")) {
    const pathPart =
      url.split(`/${GITHUB_REPO}/main/`)[1] || url.split("/master/")[1];
    if (pathPart) return `${CDN_BASE}${pathPart}`;
  }

  // 4. 处理本地相对路径 (./assets/... 或 assets/...)
  let cleanPath = url;
  if (url.startsWith("./")) {
    cleanPath = url.replace(/^\.\//, "");
  }

  // 只要是 assets 目录下的图片，都走 jsDelivr 加速
  if (cleanPath.startsWith("assets/")) {
    return `${CDN_BASE}${cleanPath}`;
  }

  // 5. 兜底逻辑：如果是放在 public 文件夹下的图片，在部署后直接通过域名访问
  // 这部分图片会随着 GitHub Pages 的 CDN 发布
  return url;
};

export const isGlobalMode = (): boolean => {
  if (typeof window === "undefined") return false;
  // 简单的国内外判定，可根据需求扩展
  return !navigator.language.includes("zh");
};
