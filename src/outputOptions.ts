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
