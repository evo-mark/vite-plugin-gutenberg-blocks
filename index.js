import { generateBundle } from "./bundle";
import { options, outputOptions } from "./resolve";
import { config } from "./config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

export const createViteBlock = (pluginConfig = {}) => {
	const pwd = process.env.PWD;
	const block = pwd.split("/").pop();

	return [
		{
			name: "create-vite-block",
			config,
			options,
			outputOptions,
			generateBundle,
		},
		viteStaticCopy({
			targets: [
				{
					src: resolve(pwd, "src/block.json"),
					dest: resolve(pwd, "../../../build/" + block),
				},
			],
		}),
		react({
			jsxRuntime: "classic",
			jsxImportSource: "@wordpress/element",
		}),
	];
};
