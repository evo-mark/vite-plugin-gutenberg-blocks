import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { resolve, sep } from "node:path";

/* *********************************************
 * External plugins required for the build process
 * ******************************************* */

const pwd = process.cwd();
const block = pwd.split(sep).pop();

const generatePlugins = ({ outDir = null } = {}) => {
	const pluginCopy = viteStaticCopy({
		silent: true,
		targets: [
			// Since they're not imported into the bundle, we need to copy these files manually
			{
				src: resolve(pwd, "src/block.json"),
				dest: ".",
				// v4 keeps the source folders by default, but WordPress expects these at the block root
				rename: { stripBase: true },
			},
			{
				src: resolve(pwd, "src/*.php"),
				dest: ".",
				rename: { stripBase: true },
			},
		],
	});

	// JSX compiles to react/jsx-runtime imports, which map to WordPress's react-jsx-runtime script
	const pluginReact = react({
		jsxRuntime: "automatic",
		jsxImportSource: "react",
	});

	return [pluginCopy, pluginReact];
};

export default generatePlugins;
