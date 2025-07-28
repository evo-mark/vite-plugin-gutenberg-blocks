import type { PluginContext, InputOptions, OutputOptions } from "rollup";
import type { ResolvedConfig } from "vite";

import { sep } from "node:path";
import { readFileSync } from "node:fs";
import { sideload } from "./buildStart.js";
import { config } from "./config.js";
import { generateBundle, type ChunkInfo, type AssetInfo } from "./generateBundle.js";
import { options } from "./options.js";
import { outputOptions } from "./outputOptions.js";
import generatePlugins from "./plugins.js";
import { transform, type WordpressBlockJson } from "./transform.js";

interface PluginConfig {
	watch?: string[];
	outDir?: string;
	dependencies?: string[];
	entryDir?: string;
}

let _config: ResolvedConfig;

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
	const pwd = process.env.PWD;
	let rootDirectory: string;
	let outputDirectory: string;

	const {
		watch = ["./src/template.php", "./src/render.php"],
		outDir = null,
		dependencies = [],
		entryDir = "src",
	} = pluginConfig;

	const blockFile: WordpressBlockJson = JSON.parse(readFileSync(`${pwd}/${entryDir}/block.json`, "utf-8"));

	const blockFolderName = entryDir ? entryDir.split(sep).pop() : pwd.split(sep).pop();

	const regex = new RegExp(sep + "$");
	const normalisedOut = regex.test(outDir) === false && outDir ? outDir + sep : outDir;

	return [
		{
			name: "vite-plugin-gutenberg-blocks",
			config: () => config({ outDir: normalisedOut, blockFile, entryDir, blockFolderName }),
			configResolved(config: ResolvedConfig) {
				_config = config;
				outputDirectory = config.build.outDir;
			},
			options,
			outputOptions,
			buildStart: async function (this: PluginContext, options: InputOptions) {
				rootDirectory = options.input[0].substring(0, options.input[0].lastIndexOf("/"));
				watch.forEach((file) => this.addWatchFile(file));

				await sideload.call(this, blockFile, outputDirectory, entryDir);
			},

			transform: function (code: string, id: string) {
				transform.call(this, code, id, blockFile, _config, entryDir);
			},
			generateBundle: function (options: OutputOptions, bundle: { [fileName: string]: ChunkInfo | AssetInfo }) {
				generateBundle.call(this, options, bundle, dependencies);
			},
		},
		...generatePlugins({ outDir: normalisedOut, entryDir }),
	];
};
