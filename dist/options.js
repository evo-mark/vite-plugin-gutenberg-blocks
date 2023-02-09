"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
const outputOptions_1 = require("./outputOptions");
function options(options) {
    if (Array.isArray(options.external) === false) {
        // If string, RegExp or function
        options.external = [options.external].filter(Boolean);
    }
    if (Array.isArray(options.external)) {
        options.external = options.external.concat(Object.keys(outputOptions_1.external));
        options.external.push(outputOptions_1.wordpressMatch);
    }
    return options;
}
exports.options = options;
