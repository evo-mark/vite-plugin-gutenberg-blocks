import { defineConfig } from "vite";
import { createViteBlock } from "../../src";

export default defineConfig({
  plugins: [
    createViteBlock({
      outDir: "build",
    }),
  ],
});
