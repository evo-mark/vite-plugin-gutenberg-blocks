"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_plugin_static_copy_1 = require("vite-plugin-static-copy");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const node_path_1 = require("node:path");
/* *********************************************
 * External plugins required for the build process
 * ******************************************* */
const pwd = process.env.PWD;
const block = pwd.split("/").pop();
const pluginCopy = (0, vite_plugin_static_copy_1.viteStaticCopy)({
    targets: [
        // Since they're not imported into the bundle, we need to copy these files manually
        {
            src: (0, node_path_1.resolve)(pwd, "src/block.json"),
            dest: (0, node_path_1.resolve)(pwd, "../../../build/" + block),
        },
        {
            src: (0, node_path_1.resolve)(pwd, "src/*.php"),
            dest: (0, node_path_1.resolve)(pwd, "../../../build/" + block),
        },
    ],
});
const pluginReact = (0, plugin_react_1.default)({
    jsxRuntime: "classic",
    jsxImportSource: "@wordpress/element",
});
exports.default = [pluginCopy, pluginReact];
