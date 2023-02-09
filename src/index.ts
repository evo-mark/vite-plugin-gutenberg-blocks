import type { PluginContext } from "rollup";
import { generateBundle } from "./generateBundle";
import { options } from "./options";
import { outputOptions } from "./outputOptions";
import { config } from "./config";
import plugins from "./plugins";
import { transform } from "./transform";

interface PluginConfig {
	watch?: string[];
}

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
	const { watch = ["./src/template.php", "./src/render.php"] } = pluginConfig;

	return [
		{
			name: "vite-plugin-gutenberg-blocks",
			config,
			options,
			outputOptions,
			buildStart: function (this: PluginContext) {
				watch.forEach((file) => this.addWatchFile(file));
			},
			transform,
			generateBundle,
		},
		...plugins,
	];
};
