"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputOptions = exports.external = exports.wordpressMatch = void 0;
const ns = "@wordpress/";
const nsExclude = ["icons", "interface"];
exports.wordpressMatch = new RegExp(`^${ns}(?!(${nsExclude.join("|")})).*$`); // /^@wordpress\/(?!(icons|interface)).*$/
exports.external = {
    jquery: "window.jQuery",
    "lodash-es": "window.lodash",
    lodash: "window.lodash",
    moment: "window.moment",
    "react-dom": "window.ReactDOM",
    react: "window.React",
};
/**
 * Returns a custom global resolver that maps external libraries and objects to their `window` counterparts
 */
function outputOptions(outputOptions) {
    // Save the original resolver so we can use it for files we're not interested in
    const configGlobals = outputOptions.globals;
    const resolveGlobals = (id) => {
        // options.globals is an object - defer to it
        if (typeof configGlobals === "object" && configGlobals.hasOwnProperty(id) && configGlobals[id]) {
            return configGlobals[id];
        }
        // options.globals is a function - defer to it
        if (typeof configGlobals === "function") {
            const configGlobalId = configGlobals(id);
            if (configGlobalId && configGlobalId !== id) {
                return configGlobalId;
            }
        }
        // see if it's a static wp external
        if (exports.external.hasOwnProperty(id) && exports.external[id]) {
            return exports.external[id];
        }
        if (exports.wordpressMatch.test(id)) {
            // convert @namespace/component-name to namespace.componentName
            return id
                .replace(new RegExp(`^${ns}`), "wp.")
                .replace(/\//g, ".")
                .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        }
        return "";
    };
    outputOptions.globals = resolveGlobals;
}
exports.outputOptions = outputOptions;
