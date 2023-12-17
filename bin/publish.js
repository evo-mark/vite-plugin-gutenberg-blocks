#! /usr/bin/env node

import { cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

const exit = (msg) => {
	console.error("ERROR: " + msg);
	process.exit(1);
};
const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");
const cwd = process.cwd();
const target = resolve(cwd + "/stubs");

if (existsSync(target)) {
	exit(target + " already exists. Aborting publish");
}

cpSync(resolve(__dirname + "/stubs/blocks"), target, { recursive: true });
console.log(chalk.green("Stubs published successfully"));
process.exit(1);
