import React, { useState, useEffect } from "react";
import { optimizeImageUrl } from "../lib/imageUtils";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * 增强型图片组件：
 * 1. 自动转换相对路径为 GitHub CDN 路径 (针对全球访问优化)
 * 2. 发生错误时自动回退到备用图片
 * 3. 严格遵循传入的 className，不添加任何额外样式包装，防止布局变形
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackSrc = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  className,
  alt,
  onLoad,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && typeof src === "string") {
      setCurrentSrc(optimizeImageUrl(src));
      setHasError(false);
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  // 直接返回 img 标签，确保 CSS 选择器和布局逻辑完全不变
  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
    />
  );
};

export default SmartImage;
