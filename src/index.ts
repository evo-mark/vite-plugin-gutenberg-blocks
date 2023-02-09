import { generateBundle } from "./generateBundle";
import { options, outputOptions } from "./resolve";
import { config } from "./config";
import plugins from "./plugins";
import type { EmittedAsset } from "./generateBundle";
import postcss from "postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";

export const createViteBlock = (pluginConfig = {}) => {
	return [
		{
			name: "css-resolve",
			async transform(code: string, id: string) {
				if (/\.css/i.test(id) === false) return;
				const cssFilePath = id
					.replace(process.cwd() + "/src", "")
					.replace(/\\/g, "/")
					.replace("/", "");


				const output = await postcss([cssnano, autoprefixer]).process(code);


				this.emitFile({
					type: "asset",
					fileName: cssFilePath,
					source: output.css,
				} satisfies EmittedAsset);
			},
		},
		{
			name: "create-vite-block",
			config,
			options,
			outputOptions,
			generateBundle,
			buildStart: function () {
				this.addWatchFile("./src/template.php");
			},
		},
		...plugins,
	];
};
