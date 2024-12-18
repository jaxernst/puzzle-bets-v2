import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    global: {},
  },
  cacheDir: "./.vite-cache",
})
