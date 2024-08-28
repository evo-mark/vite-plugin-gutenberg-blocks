import type { PluginContext, InputOptions } from "rollup";
import { sep } from "node:path";
import { readFileSync } from "node:fs";
import type { ResolvedConfig } from "vite";
import { sideload } from "./buildStart.js";
import { config } from "./config.js";
import { generateBundle } from "./generateBundle.js";
import { options } from "./options.js";
import { outputOptions } from "./outputOptions.js";
import generatePlugins from "./plugins.js";
import { transform, type WordpressBlockJson } from "./transform.js";

interface PluginConfig {
	watch?: string[];
	outDir?: string;
}

let _config: ResolvedConfig;

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
	const pwd = process.env.PWD;
	let rootDirectory: string;
	let outputDirectory: string;
	const blockFile: WordpressBlockJson = JSON.parse(readFileSync(`${pwd}/src/block.json`, "utf-8"));

	const { watch = ["./src/template.php", "./src/render.php"], outDir = null } = pluginConfig;

	const regex = new RegExp(sep + "$");
	const normalisedOut = regex.test(outDir) === false && outDir ? outDir + sep : outDir;

	return [
		{
			name: "vite-plugin-gutenberg-blocks",
			config: () => config({ outDir: normalisedOut, blockFile }),
			configResolved(config: ResolvedConfig) {
				_config = config;
				outputDirectory = config.build.outDir;
			},
			options,
			outputOptions,
			buildStart: async function (this: PluginContext, options: InputOptions) {
				rootDirectory = options.input[0].substring(0, options.input[0].lastIndexOf("/"));
				watch.forEach((file) => this.addWatchFile(file));

				await sideload.call(this, blockFile, outputDirectory);
			},

			transform: function (code: string, id: string) {
				transform.call(this, code, id, blockFile, _config);
			},
			generateBundle,
		},
		...generatePlugins({ outDir: normalisedOut }),
	];
};
