import type { PluginContext } from "rollup";
import type { WordpressBlockJson } from "./transform";
import { generateBundle } from "./generateBundle";
import { options } from "./options";
import { outputOptions } from "./outputOptions";
import { config } from "./config";
import generatePlugins from "./plugins";
import { sep } from "node:path";
import { transform } from "./transform";
import { sideload } from "./buildStart";
import { readFileSync } from "node:fs";

interface PluginConfig {
  watch?: string[];
  outDir?: string;
}

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
  const pwd = process.env.PWD;
  let rootDirectory;
  let outputDirectory: string;
  const blockFile: WordpressBlockJson = JSON.parse(
    readFileSync(`${pwd}/src/block.json`, "utf-8")
  );

  const { watch = ["./src/template.php", "./src/render.php"], outDir = null } =
    pluginConfig;

  const regex = new RegExp(sep + "$");
  const normalisedOut =
    regex.test(outDir) === false && outDir ? outDir + sep : outDir;

  return [
    {
      name: "vite-plugin-gutenberg-blocks",
      config: () => config({ outDir: normalisedOut, blockFile }),
      configResolved(config) {
        outputDirectory = config.build.outDir;
      },
      options,
      outputOptions,
      buildStart: async function (this: PluginContext, options) {
        rootDirectory = options.input[0].substring(
          0,
          options.input[0].lastIndexOf("/")
        );
        watch.forEach((file) => this.addWatchFile(file));

        sideload.call(this, blockFile, outputDirectory);
      },
      transform: function (code: string, id: string) {
        transform.call(this, code, id, rootDirectory, blockFile);
      },
      generateBundle,
    },
    ...generatePlugins({ outDir: normalisedOut }),
  ];
};
