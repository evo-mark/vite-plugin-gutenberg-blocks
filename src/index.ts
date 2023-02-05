import { generateBundle } from "./bundle";
import { options, outputOptions } from "./resolve";
import { config } from "./config";
import plugins from "./plugins";

export const createViteBlock = (pluginConfig = {}) => {
	return [
		{
			name: "create-vite-block",
			config,
			options,
			outputOptions,
			generateBundle,
		},
		...plugins,
	];
};
