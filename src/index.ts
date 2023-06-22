import type { PluginContext } from "rollup";
import { generateBundle } from "./generateBundle";
import { options } from "./options";
import { outputOptions } from "./outputOptions";
import { config } from "./config";
import generatePlugins from "./plugins";
import { sep } from "node:path";
import { transform } from "./transform";
import { readFileSync } from "node:fs";

interface PluginConfig {
  watch?: string[];
  outDir?: string;
}

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
  let rootDirectory;
  let blockFile;

  const { watch = ["./src/template.php", "./src/render.php"], outDir = null } =
    pluginConfig;

  const regex = new RegExp(sep + "$");
  const normalisedOut =
    regex.test(outDir) === false && outDir ? outDir + sep : outDir;

  return [
    {
      name: "vite-plugin-gutenberg-blocks",
      config: () => config({ outDir: normalisedOut }),
      options,
      outputOptions,
      buildStart: function (this: PluginContext, options) {
        rootDirectory = options.input[0].substring(0, options.input[0].lastIndexOf("/"));
        /* @ts-ignore */
        blockFile = JSON.parse(readFileSync(rootDirectory + "/block.json"));
        watch.forEach((file) => this.addWatchFile(file));
      },
      transform: function (code: string, id: string) {
        transform.call(this, code, id, rootDirectory, blockFile)
      },
      generateBundle,
    },
    ...generatePlugins({ outDir: normalisedOut }),
  ];
};
