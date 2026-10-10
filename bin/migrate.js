#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

/* *********************************************
 * Upgrades a 2.x block library to 3.x
 *
 * Run from the development folder (where `create` is run) or the WordPress plugin folder above it.
 *   --dry-run  Report what would change without writing anything
 *   --yes      Apply the changes without asking
 * ******************************************* */

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const autoConfirm = args.includes("--yes") || args.includes("-y");

const exit = (msg) => {
	console.error("ERROR: " + msg);
	process.exit(1);
};

// The 2.x templates, used to tell whether a user's copy is safe to replace
const legacyRegisterBlocks = `<?php

add_action('init', function() {
    $build_dir = __DIR__ . "/build";

    foreach (scandir($build_dir) as $result) {
        $block_location = $build_dir . '/' . $result;

        if (!is_dir($block_location) || '.' === $result || '..' === $result) {
            continue;
        }

        register_block_type($block_location);
    }
});
`;
const legacyIndexStub = `import { registerBlockType } from "@wordpress/blocks";

import "./style.css";

import edit from "./edit";
import save from "./save";

registerBlockType("##namespace##/##block##", {
	edit,
	save,
	attributes: {},
});
`;
const legacyNodeEngines = "^18.0.0 || ^20.0.0 || ^21.0.0 || ^22.0.0";

const normalise = (contents) => contents.replace(/\r\n/g, "\n").trim();
const isUnmodified = (path, legacy) => normalise(readFileSync(path, "utf-8")) === normalise(legacy);

/* *********************************************
 * Locate the project
 * ******************************************* */

const cwd = process.cwd();
let devDir;
if (existsSync(join(cwd, "development/package.json"))) devDir = join(cwd, "development");
else if (existsSync(join(cwd, "package.json")) && existsSync(join(cwd, "packages"))) devDir = cwd;
else exit("Run this from your development folder, or the plugin folder that contains it");

const pluginDir = dirname(devDir);
const packagesDir = join(devDir, "packages");
const blockDirs = existsSync(packagesDir)
	? readdirSync(packagesDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory() && existsSync(join(packagesDir, entry.name, "package.json")))
			.map((entry) => join(packagesDir, entry.name))
	: [];

const display = (path) => relative(cwd, path) || ".";

/* *********************************************
 * Dependency versions, taken from this version's own templates
 * ******************************************* */

const targetVersions = {};
for (const stub of ["stubs/package.json.stub", "stubs/blocks/package.json.stub"]) {
	const json = JSON.parse(readFileSync(join(pkgRoot, stub), "utf-8"));
	Object.assign(targetVersions, json.dependencies, json.devDependencies);
}

const majorOf = (range) => {
	if (typeof range !== "string" || /^(workspace|file|link|npm|git|https?):/.test(range)) return null;
	const match = range.match(/^[\^~>=\sv]*(\d+)/);
	return match ? Number(match[1]) : null;
};

/**
 * Returns the version bumps for a package.json, only raising a dependency's major version
 */
const planPackageJson = (json) => {
	const changes = [];
	for (const section of ["dependencies", "devDependencies"]) {
		for (const [name, current] of Object.entries(json[section] ?? {})) {
			const target = targetVersions[name];
			const currentMajor = majorOf(current);
			const targetMajor = majorOf(target);
			if (target && currentMajor !== null && targetMajor !== null && currentMajor < targetMajor) {
				changes.push({ section, name, from: current, to: target });
			}
		}
	}
	if (json.engines?.node === legacyNodeEngines) {
		const stub = JSON.parse(readFileSync(join(pkgRoot, "stubs/package.json.stub"), "utf-8"));
		changes.push({ section: "engines", name: "node", from: json.engines.node, to: stub.engines.node });
	}
	return changes;
};

const writeJson = (path, json, original) => {
	const indent = original.match(/^[ \t]+/m)?.[0] ?? "\t";
	writeFileSync(path, JSON.stringify(json, null, indent) + (original.endsWith("\n") ? "\n" : ""));
};

/* *********************************************
 * Build the plan
 * ******************************************* */

const actions = [];
const notes = [];

const packageJsonFiles = [join(devDir, "package.json"), ...blockDirs.map((dir) => join(dir, "package.json"))];
const publishedStubs = join(devDir, "stubs");
if (existsSync(join(publishedStubs, "package.json.stub"))) packageJsonFiles.push(join(publishedStubs, "package.json.stub"));

for (const path of packageJsonFiles) {
	const original = readFileSync(path, "utf-8");
	const json = JSON.parse(original);
	const changes = planPackageJson(json);
	if (!changes.length) continue;

	actions.push({
		description: `Update ${display(path)}`,
		details: changes.map((c) => `${c.name}: ${c.from} → ${c.to}`),
		apply: () => {
			for (const c of changes) json[c.section][c.name] = c.to;
			writeJson(path, json, original);
		},
	});
}

// register-blocks.php: replace it if it's still the 2.x template
const registerBlocks = join(pluginDir, "register-blocks.php");
const newRegisterBlocks = join(pkgRoot, "stubs/register-blocks.php.stub");
if (!existsSync(registerBlocks)) {
	notes.push(`No register-blocks.php found in ${display(pluginDir)}, so it was left alone`);
} else if (isUnmodified(registerBlocks, legacyRegisterBlocks)) {
	actions.push({
		description: `Replace ${display(registerBlocks)}`,
		details: ["Registers blocks from build/blocks-manifest.php on WordPress 6.8+", "Registers any block categories that don't exist yet"],
		apply: () => copyFileSync(newRegisterBlocks, registerBlocks),
	});
} else if (!isUnmodified(registerBlocks, readFileSync(newRegisterBlocks, "utf-8"))) {
	notes.push(
		`${display(registerBlocks)} has been customised, so it was left alone. Compare it with https://github.com/evo-mark/vite-plugin-gutenberg-blocks/blob/main/stubs/register-blocks.php.stub to pick up manifest loading and automatic categories`,
	);
}

// Published block templates: replace index.jsx.stub if it's still the 2.x template
const publishedIndex = join(publishedStubs, "src/index.jsx.stub");
if (existsSync(publishedIndex) && isUnmodified(publishedIndex, legacyIndexStub)) {
	actions.push({
		description: `Replace ${display(publishedIndex)}`,
		details: ["New blocks register from block.json metadata"],
		apply: () => copyFileSync(join(pkgRoot, "stubs/blocks/src/index.jsx.stub"), publishedIndex),
	});
}

/* *********************************************
 * Stylesheets that 3.x will no longer inject
 * ******************************************* */

const sourceFile = /\.(jsx?|tsx?|mjs)$/i;
const localStylesheet = /\.(post|s)?css$/i;
// Package imports have no reliable extension, e.g. "swiper/css" or "swiper/css/navigation"
const packageStylesheet = /(\.(post|s)?css$|\/css(\/|$))/i;
const cssImport = /import\s+(?:[\w*{}\s,]+\s+from\s+)?["']([^"']+)["']/g;

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
	);

const declaredStylesheets = (blockJson) =>
	["style", "editorStyle", "viewStyle"]
		.flatMap((key) => [blockJson[key] ?? []].flat())
		.filter((style) => typeof style === "string" && style.startsWith("file:"))
		.map((style) => style.replace(/^file:\.?\/?/, ""));

const undeclared = [];
for (const blockDir of blockDirs) {
	const srcDir = join(blockDir, "src");
	if (!existsSync(join(srcDir, "block.json"))) continue;

	const declared = declaredStylesheets(JSON.parse(readFileSync(join(srcDir, "block.json"), "utf-8")));

	for (const file of walk(srcDir).filter((f) => sourceFile.test(f))) {
		for (const [, specifier] of readFileSync(file, "utf-8").matchAll(cssImport)) {
			if (specifier.startsWith(".")) {
				if (!localStylesheet.test(specifier)) continue;
				const output = relative(srcDir, resolve(dirname(file), specifier))
					.replace(/\\/g, "/")
					.replace(localStylesheet, ".css");
				if (!declared.includes(output)) {
					undeclared.push(`${display(file)} imports ${specifier}: add "file:./${output}" to style or editorStyle in block.json`);
				}
			} else if (packageStylesheet.test(specifier)) {
				undeclared.push(`${display(file)} imports ${specifier}: @import it from a stylesheet declared in block.json`);
			}
		}
	}
}

/* *********************************************
 * Report and apply
 * ******************************************* */

console.log(chalk.bold(`\nMigrating ${display(devDir)} to vite-plugin-gutenberg-blocks 3.x\n`));

if (actions.length) {
	console.log(chalk.bold("Changes:"));
	for (const action of actions) {
		console.log(`  ${chalk.cyan("•")} ${action.description}`);
		action.details.forEach((detail) => console.log(chalk.dim(`      ${detail}`)));
	}
} else {
	console.log("No files need changing.");
}

if (undeclared.length) {
	console.log(chalk.bold.yellow("\nStylesheets that will stop loading in the editor (fix these by hand):"));
	undeclared.forEach((line) => console.log(`  ${chalk.yellow("•")} ${line}`));
}

if (notes.length) {
	console.log(chalk.bold("\nNotes:"));
	notes.forEach((line) => console.log(`  ${chalk.dim("•")} ${line}`));
}

const nextSteps = () => {
	console.log(chalk.bold("\nNext steps:"));
	console.log("  1. Reinstall dependencies in your development folder");
	console.log("  2. Rebuild your blocks and check for 'not declared in block.json' warnings");
	console.log("  3. Make sure every site using these blocks runs WordPress 6.6 or later");
	console.log(chalk.dim("\n  Full guide: https://github.com/evo-mark/vite-plugin-gutenberg-blocks/blob/main/MIGRATION.md\n"));
};

if (!actions.length || dryRun) {
	if (dryRun && actions.length) console.log(chalk.dim("\nDry run: nothing was changed."));
	nextSteps();
	process.exit(0);
}

if (!autoConfirm) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	const answer = await rl.question("\nApply these changes? (yes/y or no/n) ");
	rl.close();
	if (!/^y/i.test(answer)) {
		console.log("No changes made.");
		process.exit(0);
	}
}

for (const action of actions) action.apply();
console.log(chalk.green(`\n${actions.length} change${actions.length === 1 ? "" : "s"} applied`));
nextSteps();
process.exit(0);
