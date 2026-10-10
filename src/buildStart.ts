import type { EmittedAsset } from "./generateBundle.js";
import type { WordpressBlockJson } from "./transform.js";
import { generateFileHash, generatePhpAssetFile, extractFilenameWithoutExtension } from "./utils.js";
import { external, wordpressMatch, toWpGlobal, toHandle } from "./outputOptions.js";
import { build as esBuild } from "esbuild";
import { resolve } from "node:path";

const normaliseArray = (source: unknown) => (Array.isArray(source) ? source : [source]);

export async function sideload(blockJson: WordpressBlockJson, outputDirectory: string) {
	// Load the block.json options for "script" (frontend/backend) and "viewScript" (frontend)
	const viewScript = blockJson?.viewScript ?? [];
	const standardScript = blockJson?.script ?? [];
	// Normalise into array
	const standardScripts = normaliseArray(standardScript);
	const viewScripts = normaliseArray(viewScript);

	// Combine arrays into array of files
	const concatScripts = viewScripts
		.concat(standardScripts)
		.filter((script) => script.startsWith("file"))
		.map((script) => {
			return script.replace("file:./", "");
		});

	for (const script of concatScripts) {
		const scriptPath = resolve(`${process.cwd()}/src/${script}`);
		// Vite won't track this file for watching, so we'll add a manual watcher
		this.addWatchFile("./src/" + script);
		const wpImports = new Set<string>();
		// Build the script as a sideloaded file that isn't injected into the main bundle
		const result = await esBuild({
			entryPoints: [scriptPath],
			outfile: outputDirectory + "/" + script,
			platform: "browser",
			bundle: true,
			write: false,
			metafile: true,
			// Compile any JSX to react/jsx-runtime imports, which resolve to WordPress's copy below
			jsx: "automatic",
			plugins: [
				{
					name: "alias-wordpress",
					setup(build) {
						// Intercept @wordpress/* paths and the static externals. Bundled packages like
						// @wordpress/icons fall through to normal resolution. esbuild filters are Go
						// regexes without lookahead, so the exclusions are checked in the callback
						build.onResolve(
							{ filter: /^(@wordpress\/|(react|react-dom|react\/jsx-runtime|lodash|lodash-es|jquery|moment)$)/ },
							(args) => {
								if (!external[args.path] && !wordpressMatch.test(args.path)) return undefined;
								return {
									path: args.path,
									namespace: "wordpress-alias",
								};
							},
						);

						// Re-export the matching window global, so default imports get the module itself
						build.onLoad({ filter: /.*/, namespace: "wordpress-alias" }, (args) => {
							wpImports.add(toHandle(args.path));
							const global = external[args.path] ?? "window." + toWpGlobal(args.path);
							return {
								contents: `module.exports = ${global};`,
								loader: "js",
							};
						});
					},
				},
			],
		});

		const bundledDependencies = Object.keys(result.metafile.inputs).filter((dep) => {
			if (dep === "src/" + script) return false;
			if (/:/.test(dep)) return false;
			else return true;
		});

		bundledDependencies.forEach((dep) => {
			this.addWatchFile("./" + dep);
		});

		result.outputFiles.forEach((file) => {
			const hash = generateFileHash(file.text);
			const filename = extractFilenameWithoutExtension(script);

			this.emitFile({
				type: "asset",
				fileName: filename + ".asset.php",
				source: generatePhpAssetFile(wpImports, hash),
			} satisfies EmittedAsset);
			this.emitFile({
				type: "asset",
				fileName: script,
				source: file.contents,
			} satisfies EmittedAsset);
		});
	}

	return true;
}
