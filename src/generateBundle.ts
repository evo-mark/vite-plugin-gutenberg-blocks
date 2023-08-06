import crypto from "node:crypto";
import type { SourceMap } from "node:module";
import type { OutputOptions, PluginContext } from "rollup";

export type EmittedAsset = {
	type: 'asset';
	name?: string;
	needsCodeReference?: boolean;
	fileName?: string;
	source?: string | Uint8Array;
};

type AssetInfo = {
	fileName: string;
	name?: string;
	needsCodeReference: boolean;
	source: string | Uint8Array;
	type: "asset";
	code: string;
	imports: string[];
};

type ChunkInfo = {
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
export function generateBundle(this: PluginContext, options: OutputOptions, bundle: { [fileName: string]:  ChunkInfo | AssetInfo }) {
	let hash: string = "";

	const imports = Object.values(bundle).reduce((acc, file) => {
		if (!file.code || file.name === 'scripts.js') return acc;

		hash = crypto.createHash("md5").update(file.code).digest("hex");
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
	} satisfies EmittedAsset);

	if(!Object.keys(bundle).includes("viewScript.js")) return;
	let frontendHash: string = "";
	const importsFrontend = Object.values(bundle).reduce((acc, file) => {
		if (!file.code || file.name !== 'viewScript.js') return acc;

		frontendHash = crypto.createHash("md5").update(file.code).digest("hex");
		file.imports.forEach((i) => {
			i = i.replace(/^@wordpress\//, "wp-");
			acc.add(i);
		}, acc);
		return acc;
	}, new Set());

	this.emitFile({
		type: "asset",
		fileName: "viewScript.asset.php",
		source: `<?php return ["dependencies" => ${JSON.stringify(Array.from(importsFrontend))}, "version" => "${hash}"];`,
	} satisfies EmittedAsset);
}
