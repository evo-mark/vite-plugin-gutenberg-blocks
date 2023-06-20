import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { resolve, sep } from "node:path";

/* *********************************************
 * External plugins required for the build process
 * ******************************************* */

const pwd = process.env.PWD;
const block = pwd.split(sep).pop();

export const generatePlugins = ({ outDir = null } = {}) => {
	const targetDir = outDir ? outDir + block : resolve(pwd, "../../../build/" + block);

	const pluginCopy = viteStaticCopy({
		targets: [
			// Since they're not imported into the bundle, we need to copy these files manually
			{
				src: resolve(pwd, "src/block.json"),
				dest: targetDir,
			},
			{
				src: resolve(pwd, "src/*.php"),
				dest: targetDir,
			},
		],
	});
	
	const pluginReact = react({
		jsxRuntime: "classic",
		jsxImportSource: "@wordpress/element",
	});

	return [pluginCopy, pluginReact];
}