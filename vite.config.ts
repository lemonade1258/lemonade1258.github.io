import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 对于 lemonade1258.github.io 这种根目录仓库，base 设为 '/'
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
