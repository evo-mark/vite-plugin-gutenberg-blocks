"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViteBlock = void 0;
const generateBundle_1 = require("./generateBundle");
const options_1 = require("./options");
const outputOptions_1 = require("./outputOptions");
const config_1 = require("./config");
const plugins_1 = __importDefault(require("./plugins"));
const transform_1 = require("./transform");
const createViteBlock = (pluginConfig = {}) => {
    const { watch = ["./src/template.php", "./src/render.php"] } = pluginConfig;
    return [
        {
            name: "vite-plugin-gutenberg-blocks",
            config: config_1.config,
            options: options_1.options,
            outputOptions: outputOptions_1.outputOptions,
            buildStart: function () {
                watch.forEach((file) => this.addWatchFile(file));
            },
            transform: transform_1.transform,
            generateBundle: generateBundle_1.generateBundle,
        },
        ...plugins_1.default,
    ];
};
exports.createViteBlock = createViteBlock;
