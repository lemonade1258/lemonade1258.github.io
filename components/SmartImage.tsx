import React, { useState, useEffect } from "react";
import { optimizeImageUrl } from "../lib/imageUtils";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * 智能图片组件：
 * 1. 自动应用 jsDelivr CDN 加速
 * 2. 错误自动回退
 * 3. 渐进式加载效果
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      // Fix: The 'src' prop from React.ImgHTMLAttributes might be inferred as string | Blob in some environments.
      // Since optimizeImageUrl expects a string, we explicitly check the type before calling it.
      const optimized = typeof src === "string" ? optimizeImageUrl(src) : "";
      setCurrentSrc(optimized);
      setHasError(false);
      setIsLoaded(false);
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
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
