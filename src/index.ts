import type { PluginContext } from "rollup";
import { generateBundle } from "./generateBundle";
import { options } from "./options";
import { outputOptions } from "./outputOptions";
import { config } from "./config";
import { generatePlugins} from "./plugins";
import { transform } from "./transform";

interface PluginConfig {
	watch?: string[];
	outDir?: string;
}

export const createViteBlock = (pluginConfig = {} as PluginConfig) => {
	const { watch = ["./src/template.php", "./src/render.php"], outDir = null } = pluginConfig;

	return [
		{
			name: "vite-plugin-gutenberg-blocks",
			config: () => config({ outDir }),
			options,
			outputOptions,
			buildStart: function (this: PluginContext) {
				watch.forEach((file) => this.addWatchFile(file));
			},
			transform,
			generateBundle,
		},
		...generatePlugins({ outDir }),
	];
};
