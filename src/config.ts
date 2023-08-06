import { resolve, sep } from "node:path";
import iife from "rollup-plugin-iife";
import fs from "fs"
/**
 * config
 *
 * Provides Vite config settings required to build Gutenberg blocks
 *
 * @see https://vitejs.dev/guide/api-plugin.html#config
 */
export const config = ({ outDir = null } = {}) => {
  const pwd = process.env.PWD;
  const block = pwd.split(sep).pop();
  const frontendScriptPath = resolve(pwd, "src/frontend/viewScript.jsx");
  const backendScriptPath = resolve(pwd, "src/index.jsx");
  const isFrontendScript = fs.existsSync(frontendScriptPath);
  const entry = isFrontendScript ? [backendScriptPath, frontendScriptPath] : backendScriptPath;

  return {
    define: { "process.env.NODE_ENV": `"${process.env.NODE_ENV}"` },
    build: {
      rollupOptions: {
        input: entry,
        plugins: [iife()],
        output: {
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      },
      outDir: outDir ? outDir + block : resolve(pwd, "../../../build/" + block),
      target: "esnext",
      minify: true,
      // If you specify build.lib, build.cssCodeSplit will be false as default.
      // https://vitejs.dev/config/build-options.html#build-csscodesplit
      cssCodeSplit: true, // This option stops the default `styles.css` from being bundled
    },
  };
};
