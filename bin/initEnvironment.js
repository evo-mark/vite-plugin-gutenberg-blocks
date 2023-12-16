#! /usr/bin/env node

import { existsSync, mkdirSync, cpSync, copyFileSync, constants as fsConstants, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");
const cwd = process.cwd();

const dirs = ["/development", "/development/packages", "/development/stubs"];

for (let directory of dirs) {
	if (!existsSync(resolve(cwd + directory))) {
		mkdirSync(resolve(cwd + directory));
	}
}

cpSync(resolve(__dirname + "/stubs/blocks"), resolve(cwd + "/development/stubs"), { recursive: true });

copyFileSync(
	resolve(__dirname + "/stubs/register-blocks.php.stub"),
	resolve(cwd + "/register-blocks.php"),
	fsConstants.COPYFILE_FICLONE
);
copyFileSync(
	resolve(__dirname + "/stubs/package.json.stub"),
	resolve(cwd + "/development/package.json"),
	fsConstants.COPYFILE_FICLONE
);
copyFileSync(
	resolve(__dirname + "/stubs/lerna.json.stub"),
	resolve(cwd + "/development/lerna.json"),
	fsConstants.COPYFILE_FICLONE
);

const ignore = `build
node_modules`;

writeFileSync(resolve(cwd + "/development/.gitignore"), ignore, { encoding: "utf-8" });

console.log(chalk.green("Development environment created successfully"));
