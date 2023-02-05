"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViteBlock = void 0;
const bundle_1 = require("./bundle");
const resolve_1 = require("./resolve");
const config_1 = require("./config");
const plugins_1 = __importDefault(require("./plugins"));
const createViteBlock = (pluginConfig = {}) => {
    return [
        {
            name: "create-vite-block",
            config: config_1.config,
            options: resolve_1.options,
            outputOptions: resolve_1.outputOptions,
            generateBundle: bundle_1.generateBundle,
        },
        ...plugins_1.default,
    ];
};
exports.createViteBlock = createViteBlock;
