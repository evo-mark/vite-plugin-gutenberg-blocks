import { resolve, sep } from "node:path";

/**
 * config
 *
 * Provides Vite config settings required to build Gutenberg blocks
 *
 * @see https://vitejs.dev/guide/api-plugin.html#config
 */
export const config = ({ outDir = null, blockFile = null } = {}) => {
	const pwd = process.env.PWD;
	const block = pwd.split(sep).pop();

	return {
		define: { "process.env.NODE_ENV": `"${process.env.NODE_ENV}"` },
		build: {
			lib: {
				entry: resolve(pwd, "src/index.jsx"),
				name: "index",
				formats: ["iife"],
				fileName: () => "index.js",
			},
			outDir: outDir ? outDir + block : resolve(pwd, "../../../build/" + block),
			rollupOptions: {},
			target: "es2020",
			minify: true,
			cssCodeSplit: true, // This option stops the default `styles.css` from being bundled
		},
	};
};
