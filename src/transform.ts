import { PluginContext } from "rollup";
import { sep } from "node:path";
import type { EmittedAsset } from "./generateBundle.js";
import { preprocessCSS, ResolvedConfig } from "vite";

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
): Promise<string | boolean | void> {
	const [filename] = id.split("?");
	const isStylesheet = /\.(post|s)?css$/i.test(filename) === true;
	if (!isStylesheet) return;

	const result = await preprocessCSS(code, id, config);

	const outputPath = trimSlashes(id.replace(`${process.cwd()}${sep}src`, "").replace(/\\/g, "/")).replace(
		/\.(post|s)?css$/i,
		".css"
	);

	const style = blockFile?.style ? wrapArray(blockFile.style) : [];
	const editorStyle = blockFile?.editorStyle ? wrapArray(blockFile.editorStyle) : [];
	const viewStyle = blockFile?.viewStyle ? wrapArray(blockFile.viewStyle) : [];
	const stylesheets = ([...style, ...editorStyle, ...viewStyle].flat(Infinity) as string[])
		.filter((s) => !!s)
		.map((s) => trimSlashes(s.replace("file:.", "")));

	if (stylesheets.includes(outputPath) === false) return result.code;

	this.emitFile({
		type: "asset",
		fileName: outputPath,
		source: result.code,
	} satisfies EmittedAsset);
}
