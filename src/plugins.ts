import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const pwd = process.env.PWD;
const block = pwd.split("/").pop();

const pluginCopy = viteStaticCopy({
	targets: [
		{
			src: resolve(pwd, "src/block.json"),
			dest: resolve(pwd, "../../../build/" + block),
		},
		{
			src: resolve(pwd, "src/*.php"),
			dest: resolve(pwd, "../../../build/" + block),
		},
	],
});

const pluginReact = react({
	jsxRuntime: "classic",
	jsxImportSource: "@wordpress/element",
});

export default [pluginCopy, pluginReact];
