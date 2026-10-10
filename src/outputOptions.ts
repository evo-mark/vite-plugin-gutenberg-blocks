import type { OutputOptions } from "rollup";

const ns = "@wordpress/";
const nsExclude = ["icons", "interface"];
export const wordpressMatch = new RegExp(`^${ns}(?!(${nsExclude.join("|")})).*$`); // /^@wordpress\/(?!(icons|interface)).*$/

export const external: Record<string, string> = {
	jquery: "window.jQuery",
	"lodash-es": "window.lodash",
	lodash: "window.lodash",
	moment: "window.moment",
	"react-dom": "window.ReactDOM",
	react: "window.React",
	"react/jsx-runtime": "window.ReactJSXRuntime",
};

/**
 * WordPress script handles for the static externals
 */
export const handles: Record<string, string> = {
	jquery: "jquery",
	"lodash-es": "lodash",
	lodash: "lodash",
	moment: "moment",
	"react-dom": "react-dom",
	react: "react",
	// Registered by WordPress 6.6+
	"react/jsx-runtime": "react-jsx-runtime",
};

/**
 * Converts @wordpress/component-name to wp.componentName
 */
export const toWpGlobal = (id: string) =>
	id
		.replace(new RegExp(`^${ns}`), "wp.")
		.replace(/\//g, ".")
		.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/**
 * Converts an import id to the WordPress script handle that provides it
 */
export const toHandle = (id: string) => handles[id] ?? id.replace(new RegExp(`^${ns}`), "wp-");

/**
 * Returns a custom global resolver that maps external libraries and objects to their `window` counterparts
 */
export function outputOptions(outputOptions: OutputOptions) {
	// Save the original resolver so we can use it for files we're not interested in
	const configGlobals = outputOptions.globals;

	const resolveGlobals = (id: string) => {
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
		if (external.hasOwnProperty(id) && external[id]) {
			return external[id];
		}

		if (wordpressMatch.test(id)) {
			return toWpGlobal(id);
		}

		return "";
	};

	outputOptions.globals = resolveGlobals;
}
