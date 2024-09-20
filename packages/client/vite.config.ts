import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    global: {},
  },
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
    },
  },
  cacheDir: "./.vite-cache",
})
