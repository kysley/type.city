import pkg from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const { vitePlugin } = pkg;

export default defineConfig({
  plugins: [vitePlugin({ ssr: false }), tsconfigPaths()],
});
