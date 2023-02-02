import { resolve } from "node:path";

export const config = (config, { command }) => {
	const pwd = process.env.PWD;
	const block = pwd.split("/").pop();

	return {
		define: { "process.env.NODE_ENV": `"${process.env.NODE_ENV}"` },
		build: {
			lib: {
				entry: resolve(pwd, "src/index.jsx"),
				name: "index",
				formats: ["cjs"],
				fileName: () => "index.js",
			},
			outDir: resolve(pwd, "../../../build/" + block),
			rollupOptions: {
				input: resolve(pwd, "src/index.jsx"),
				preserveEntrySignatures: true,
			},
		},
	};
};
