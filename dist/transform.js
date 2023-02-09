"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const postcss_1 = __importDefault(require("postcss"));
const cssnano_1 = __importDefault(require("cssnano"));
const autoprefixer_1 = __importDefault(require("autoprefixer"));
/**
 * transform
 *
 * Catches any CSS files imported into the block, normalises their filepath and then emits them as
 * separate files into the final build.
 *
 * Enables each Wordpress build folder to maintain its structure like style.css, editor-style.css et al.
 *
 * @see https://rollupjs.org/plugin-development/#transform
 */
async function transform(code, id) {
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
}
exports.transform = transform;
;
