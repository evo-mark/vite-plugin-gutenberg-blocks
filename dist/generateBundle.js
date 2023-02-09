"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBundle = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * generateBundle
 *
 * Wordpress blocks wont be detected unless an `index.asset.php` file is generated for each one which
 * tells WP information about versioning and dependencies.
 *
 * This function maps the imports from the @wordpress namespace, generates a version hash and then
 * emits the required php file into the build folder
 *
 * @see https://rollupjs.org/plugin-development/#generatebundle
 */
function generateBundle(options, bundle) {
    let hash = "";
    const imports = Object.values(bundle).reduce((acc, file) => {
        if (!file.code)
            return acc;
        hash = node_crypto_1.default.createHash("md5").update(file.code).digest("hex");
        file.imports.forEach((i) => {
            i = i.replace(/^@wordpress\//, "wp-");
            acc.add(i);
        }, acc);
        return acc;
    }, new Set());
    this.emitFile({
        type: "asset",
        fileName: "index.asset.php",
        source: `<?php return ["dependencies" => ${JSON.stringify(Array.from(imports))}, "version" => "${hash}"];`,
    });
}
exports.generateBundle = generateBundle;
