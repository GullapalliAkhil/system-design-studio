import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps every asset URL relative, so the same build works on
// GitHub Pages under /<repo>/, on a custom domain, and from file://.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "dist", sourcemap: false },
});
