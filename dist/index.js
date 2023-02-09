"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViteBlock = void 0;
const generateBundle_1 = require("./generateBundle");
const resolve_1 = require("./resolve");
const config_1 = require("./config");
const plugins_1 = __importDefault(require("./plugins"));
const postcss_1 = __importDefault(require("postcss"));
const cssnano_1 = __importDefault(require("cssnano"));
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const createViteBlock = (pluginConfig = {}) => {
    return [
        {
            name: "css-resolve",
            async transform(code, id) {
                if (/\.css/i.test(id) === false)
                    return;
                const cssFilePath = id
                    .replace(process.cwd() + "/src", "")
                    .replace(/\\/g, "/")
                    .replace("/", "");
                const output = await (0, postcss_1.default)([cssnano_1.default, autoprefixer_1.default]).process(code);
                this.emitFile({
                    type: "asset",
                    fileName: cssFilePath,
                    source: output.css,
                });
            },
        },
        {
            name: "create-vite-block",
            config: config_1.config,
            options: resolve_1.options,
            outputOptions: resolve_1.outputOptions,
            generateBundle: generateBundle_1.generateBundle,
            buildStart: function () {
                this.addWatchFile("./src/template.php");
            },
        },
        ...plugins_1.default,
    ];
};
exports.createViteBlock = createViteBlock;
