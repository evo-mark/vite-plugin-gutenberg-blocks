import type { ChunkInfo, AssetInfo } from "./generateBundle.js";
import { external, wordpressMatch, toWpGlobal, toHandle } from "./outputOptions.js";

/**
 * Prefix for the virtual modules that stand in for scripts WordPress already provides
 */
const PREFIX = "\0wp-global:";

/**
 * The window global that provides an import, or null if the import should be bundled
 */
export const toGlobal = (id: string): string | null => {
	if (external[id]) return external[id];
	if (wordpressMatch.test(id)) return "window." + toWpGlobal(id);
	return null;
};

/**
 * resolveId
 *
 * Points WordPress-provided imports at a virtual module instead of marking them external. Rolldown
 * leaves `require()` calls to externals untouched, which breaks in the browser. Bundled CommonJS
 * dependencies (and libraries pre-built with webpack, like @mdi/react) call `require("react")`.
 *
 * @see https://rolldown.rs/in-depth/bundling-cjs
 */
export function resolveId(id: string) {
	return toGlobal(id) ? PREFIX + id : null;
}

/**
 * load
 *
 * A CommonJS module that re-exports the window global, so `require()`, default imports and named
 * imports all resolve to WordPress's copy at runtime
 */
export function load(id: string) {
	if (!id.startsWith(PREFIX)) return null;
	return `module.exports = ${toGlobal(id.slice(PREFIX.length))};`;
}

/**
 * The WordPress script handles for every window global used by the bundle
 */
export function globalHandles(bundle: { [fileName: string]: ChunkInfo | AssetInfo }): string[] {
	return Object.values(bundle)
		.flatMap((file) => ("moduleIds" in file ? file.moduleIds : []))
		.filter((id) => id.startsWith(PREFIX))
		.map((id) => toHandle(id.slice(PREFIX.length)));
}
