/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

// npm run build         → hosted PWA (offline, auto-updating)   → dist/
// npm run build:single  → one self-contained HTML file for demos → dist-single/index.html
export default defineConfig(({ mode }) => {
  const single = mode === "single";
  return {
    base: "./",
    build: single ? { outDir: "dist-single", assetsInlineLimit: Infinity } : undefined,
    plugins: [
      react(),
      VitePWA({
            disable: single, // single-file build: no service worker
            registerType: "prompt",
            includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
            manifest: {
              name: "Ventara — Ventilator Settings Translator",
              short_name: "Ventara",
              description: "Translate home ventilator settings between devices, with every value explained.",
              theme_color: "#0a6ebd",
              background_color: "#ffffff",
              display: "standalone",
              start_url: ".",
              icons: [
                { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
                { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
                { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
                { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
              ],
            },
            workbox: { globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] },
          }),
      single && viteSingleFile(),
    ],
    test: { include: ["src/**/*.test.ts"] },
  };
});
