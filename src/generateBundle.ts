import { generateFileHash, generatePhpAssetFile } from "./utils.js";
import { toHandle } from "./outputOptions.js";
import { globalHandles } from "./globals.js";
import type { SourceMap } from "node:module";
import type { OutputOptions, PluginContext } from "rollup";
import type { ResolvedConfig } from "vite";

export type EmittedAsset = {
	type: "asset";
	name?: string;
	needsCodeReference?: boolean;
	fileName?: string;
	source?: string | Uint8Array;
};

export type AssetInfo = {
	fileName: string;
	name?: string;
	needsCodeReference: boolean;
	source: string | Uint8Array;
	type: "asset";
	code: string;
	imports: string[];
};

export type ChunkInfo = {
	code: string;
	dynamicImports: string[];
	exports: string[];
	facadeModuleId: string | null;
	fileName: string;
	implicitlyLoadedBefore: string[];
	imports: string[];
	importedBindings: { [imported: string]: string[] };
	isDynamicEntry: boolean;
	isEntry: boolean;
	isImplicitEntry: boolean;
	map: SourceMap | null;
	modules: {
		[id: string]: {
			renderedExports: string[];
			removedExports: string[];
			renderedLength: number;
			originalLength: number;
			code: string | null;
		};
	};
	moduleIds: string[];
	name: string;
	referencedFiles: string[];
	type: "chunk";
};

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
export function generateBundle(
	this: PluginContext,
	options: OutputOptions,
	bundle: { [fileName: string]: ChunkInfo | AssetInfo },
	dependencies: string[]
) {
	let hash: string = "";

	const imports = Object.values(bundle).reduce((acc, file) => {
		if (!file.code) return acc;

		hash = generateFileHash(file.code);
		file.imports.forEach((i) => acc.add(toHandle(i)));
		return acc;
	}, new Set()) as Set<string>;

	// WordPress-provided scripts are bundled as virtual modules, so they aren't listed in `imports`
	for (const handle of globalHandles(bundle)) {
		imports.add(handle);
	}

	for (const dependency of dependencies) {
		imports.add(dependency);
	}

	this.emitFile({
		type: "asset",
		fileName: "index.asset.php",
		source: generatePhpAssetFile(imports, hash),
	} satisfies EmittedAsset);
}
