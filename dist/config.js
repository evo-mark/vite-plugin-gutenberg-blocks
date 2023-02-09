"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_path_1 = require("node:path");
/**
 * config
 *
 * Provides Vite config settings required to build Gutenberg blocks
 *
 * @see https://vitejs.dev/guide/api-plugin.html#config
 */
const config = () => {
    const pwd = process.env.PWD;
    const block = pwd.split("/").pop();
    return {
        define: { "process.env.NODE_ENV": `"${process.env.NODE_ENV}"` },
        build: {
            lib: {
                entry: (0, node_path_1.resolve)(pwd, "src/index.jsx"),
                name: "index",
                formats: ["iife"],
                fileName: () => "index.js",
            },
            outDir: (0, node_path_1.resolve)(pwd, "../../../build/" + block),
            rollupOptions: {},
            target: "esnext",
            minify: true,
            cssCodeSplit: true, // This option stops the default `styles.css` from being bundled
        },
    };
};
exports.config = config;
