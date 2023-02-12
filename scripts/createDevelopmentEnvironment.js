#! /usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const cwd = process.cwd();

const dirs = ["/development", "/development/scripts", "/development/packages", "/development/stubs"];

for (let directory of dirs) {
	if (!fs.existsSync(path.resolve(cwd + directory))) {
		fs.mkdirSync(path.resolve(cwd + directory));
	}
}

fs.cpSync(path.resolve(__dirname + "/stubs/publish"), path.resolve(cwd + "/development/stubs"), { recursive: true });
fs.copyFileSync(
	path.resolve(__dirname + "/stubs/scripts/create.mjs.stub"),
	path.resolve(cwd + "/development/scripts/create.mjs"),
	fs.constants.COPYFILE_FICLONE
);
fs.copyFileSync(
	path.resolve(__dirname + "/stubs/register-blocks.php.stub"),
	path.resolve(cwd + "/register-blocks.php"),
	fs.constants.COPYFILE_FICLONE
);
fs.copyFileSync(
	path.resolve(__dirname + "/stubs/package.json.stub"),
	path.resolve(cwd + "/development/package.json"),
	fs.constants.COPYFILE_FICLONE
);
fs.copyFileSync(
	path.resolve(__dirname + "/stubs/lerna.json.stub"),
	path.resolve(cwd + "/development/lerna.json"),
	fs.constants.COPYFILE_FICLONE
);
fs.writeFileSync(path.resolve(cwd + "/development/.gitignore"), "build", { encoding: "utf-8" });

console.log("Development environment created successfully");
