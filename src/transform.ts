import { PluginContext } from "rollup";
import { resolve } from "node:path";
import type { EmittedAsset } from "./generateBundle.js";
import { preprocessCSS, normalizePath, ResolvedConfig } from "vite";

export interface WordpressBlockJson {
	style: string | string[];
	editorStyle?: string | string[];
	viewStyle?: string | string[];
	viewScript?: string | string[];
	script?: string | string[];
}

function trimSlashes(filename: string): string {
	return filename.replace(/^[/\\]+|[/\\]+$/g, "");
}
function wrapArray<T>(maybeArray: T | T[]): T[] {
	return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

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
export async function transform(
	this: PluginContext,
	code: string,
	id: string,
	blockFile: WordpressBlockJson,
	config: ResolvedConfig
): Promise<string | { code: string; map: null } | void> {
	const [filename] = id.split("?");
	const isStylesheet = /\.(post|s)?css$/i.test(filename) === true;
	if (!isStylesheet) return;

	const result = await preprocessCSS(code, id, config);

	// Vite ids use forward slashes on every platform, so normalise the src folder to match
	const srcDir = normalizePath(resolve(process.cwd(), "src"));
	const outputPath = trimSlashes(normalizePath(filename).replace(srcDir, "")).replace(/\.(post|s)?css$/i, ".css");

	const style = blockFile?.style ? wrapArray(blockFile.style) : [];
	const editorStyle = blockFile?.editorStyle ? wrapArray(blockFile.editorStyle) : [];
	const viewStyle = blockFile?.viewStyle ? wrapArray(blockFile.viewStyle) : [];
	const stylesheets = ([...style, ...editorStyle, ...viewStyle].flat(Infinity) as string[])
		.filter((s) => !!s)
		.map((s) => trimSlashes(s.replace("file:.", "")));

	if (stylesheets.includes(outputPath) === false) {
		this.warn(`${outputPath} is not declared in block.json so WordPress will not load it`);
		return result.code;
	}

	this.emitFile({
		type: "asset",
		fileName: outputPath,
		source: result.code,
	} satisfies EmittedAsset);

	// Emitted as its own file, so leave nothing for Vite to inject into the JS bundle
	return { code: "", map: null };
}
