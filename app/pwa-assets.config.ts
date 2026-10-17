import { defineConfig, minimal2023Preset as p } from "@vite-pwa/assets-generator/config";

const bg = { background: "#0a6ebd" };

export default defineConfig({
  preset: {
    ...p,
    maskable: { ...p.maskable, resizeOptions: bg },
    apple: { ...p.apple, resizeOptions: bg },
  },
  images: ["public/favicon.svg"],
});
