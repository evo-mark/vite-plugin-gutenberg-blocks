"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_path_1 = require("node:path");
const config = (config, { command }) => {
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
            rollupOptions: {
                input: (0, node_path_1.resolve)(pwd, "src/index.jsx"),
            },
        },
    };
};
exports.config = config;
