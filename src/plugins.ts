import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { resolve, sep } from "node:path";

/* *********************************************
 * External plugins required for the build process
 * ******************************************* */

const pwd = process.env.PWD;
const block = pwd.split(sep).pop();

const generatePlugins = ({ outDir = null } = {}) => {
	const pluginCopy = viteStaticCopy({
		silent: true,
		targets: [
			// Since they're not imported into the bundle, we need to copy these files manually
			{
				src: resolve(pwd, "src/block.json"),
				dest: ".",
			},
			{
				src: resolve(pwd, "src/*.php"),
				dest: ".",
			},
		],
	});

	const pluginReact = react({
		jsxRuntime: "classic",
		jsxImportSource: "@wordpress/element",
	});

	return [pluginCopy, pluginReact];
};

export default generatePlugins;
