import React, { useState, useEffect } from "react";
import { optimizeImageUrl } from "../lib/imageUtils";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * 智能图片组件 V3：
 * 1. 优先尝试 CDN 加速
 * 2. 如果 CDN 失败（可能是文件太大），自动切换到 Origin 直连
 * 3. 如果 Origin 也失败，显示最终备选图
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
  const [retryStage, setRetryStage] = useState<number>(0); // 0: CDN, 1: Origin, 2: Fallback
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (src && typeof src === "string") {
      setCurrentSrc(optimizeImageUrl(src, false));
      setRetryStage(0);
      setIsLoaded(false);
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryStage === 0 && src && typeof src === "string") {
      // 尝试阶段 1: 切换到 Origin
      console.warn(`CDN Load failed for ${src}, retrying with Origin...`);
      setRetryStage(1);
      setCurrentSrc(optimizeImageUrl(src, true));
    } else if (retryStage === 1) {
      // 尝试阶段 2: 彻底失败，用备选图
      console.error(`Origin Load also failed for ${src}, using fallback.`);
      setRetryStage(2);
      setCurrentSrc(fallbackSrc);
    }

    if (onError) onError(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={`${className} transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default SmartImage;
