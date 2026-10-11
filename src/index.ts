import type { PluginContext, InputOptions, OutputOptions } from "rollup";
import type { ResolvedConfig } from "vite";

import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { sideload } from "./buildStart.js";
import { config } from "./config.js";
import { generateBundle, type ChunkInfo, type AssetInfo } from "./generateBundle.js";
import { load, resolveId } from "./globals.js";
import { writeBlocksManifest } from "./manifest.js";
import generatePlugins from "./plugins.js";
import { transform, type WordpressBlockJson } from "./transform.js";

interface PluginConfig {
	watch?: string[];
	outDir?: string;
	dependencies?: string[];
}

let _config: ResolvedConfig;

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
	const pwd = process.cwd();
	let rootDirectory: string;
	let outputDirectory: string;
	const blockFile: WordpressBlockJson = JSON.parse(readFileSync(`${pwd}/src/block.json`, "utf-8"));

	const { watch = ["./src/template.php", "./src/render.php"], outDir = null, dependencies = [] } = pluginConfig;

	const normalisedOut = outDir && !/[\\/]$/.test(outDir) ? outDir + "/" : outDir;

	return [
		{
			// Runs before Vite's resolver, which would otherwise bundle the copies in node_modules
			name: "vite-plugin-gutenberg-blocks:globals",
			enforce: "pre" as const,
			resolveId,
			load,
		},
		{
			name: "vite-plugin-gutenberg-blocks",
			config: () => config({ outDir: normalisedOut, blockFile }),
			configResolved(config: ResolvedConfig) {
				_config = config;
				outputDirectory = config.build.outDir;
			},
			buildStart: async function (this: PluginContext, options: InputOptions) {
				rootDirectory = options.input[0].substring(0, options.input[0].lastIndexOf("/"));
				watch.forEach((file) => this.addWatchFile(file));

				await sideload.call(this, blockFile, outputDirectory);
			},

			transform: function (code: string, id: string) {
				return transform.call(this, code, id, blockFile, _config);
			},
			generateBundle: function (options: OutputOptions, bundle: { [fileName: string]: ChunkInfo | AssetInfo }) {
				generateBundle.call(this, options, bundle, dependencies);
			},
			closeBundle(this: PluginContext) {
				// Every block's output folder sits side by side in the build folder
				writeBlocksManifest.call(this, dirname(outputDirectory));

				if (process && (process as any)._getActiveHandles) {
					for (const handle of (process as any)._getActiveHandles()) {
						if (handle?.spawnfile?.includes("dart-sass")) {
							handle.kill();
						}
					}
				}
			},
		},
		...generatePlugins({ outDir: normalisedOut }),
	];
};
