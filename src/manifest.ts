import type { PluginContext } from "rollup";
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Converts a decoded JSON value to a PHP literal, matching what json_decode($json, true) returns.
 * Strings are single-quoted so values like "$schema" aren't interpolated
 */
export const toPhpValue = (value: unknown, indent = ""): string => {
	if (value === null || value === undefined) return "null";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
	if (typeof value === "string") return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

	const inner = indent + "\t";
	const items = Array.isArray(value)
		? value.map((item) => inner + toPhpValue(item, inner))
		: Object.entries(value).map(([key, item]) => `${inner}${toPhpValue(key)} => ${toPhpValue(item, inner)}`);

	return items.length ? `[\n${items.join(",\n")},\n${indent}]` : "[]";
};

/**
 * writeBlocksManifest
 *
 * Collects the block.json of every block in the build folder into a single blocks-manifest.php, which
 * WordPress 6.8+ can register in one go with wp_register_block_types_from_metadata_collection().
 *
 * Each block is built separately, so every build rewrites the whole manifest from what's on disk. The
 * last build to finish has seen every block
 *
 * @see https://developer.wordpress.org/reference/functions/wp_register_block_types_from_metadata_collection/
 */
export function writeBlocksManifest(this: PluginContext, buildDirectory: string) {
	if (!existsSync(buildDirectory)) return;

	const blocks: Record<string, unknown> = {};

	for (const entry of readdirSync(buildDirectory, { withFileTypes: true })) {
		const blockJson = join(buildDirectory, entry.name, "block.json");
		if (!entry.isDirectory() || !existsSync(blockJson)) continue;

		try {
			blocks[entry.name] = JSON.parse(readFileSync(blockJson, "utf-8"));
		} catch (error) {
			this.warn(`Skipping ${entry.name} in blocks-manifest.php: ${(error as Error).message}`);
		}
	}

	// Write then rename, so parallel builds never leave a half-written file for WordPress to load
	const manifest = join(buildDirectory, "blocks-manifest.php");
	const temporary = `${manifest}.${process.pid}.tmp`;
	writeFileSync(temporary, `<?php\n// This file is generated. Do not modify it manually.\nreturn ${toPhpValue(blocks)};\n`);
	renameSync(temporary, manifest);
}
