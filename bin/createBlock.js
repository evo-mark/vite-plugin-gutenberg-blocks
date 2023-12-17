#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)) + "/../");
const __dirname = resolve();

const slugify = (str) =>
	str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

function walk(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((file) =>
		file.isDirectory() ? walk(join(dir, file.name)) : join(dir, file.name)
	);
}

const exit = (msg) => {
	console.error("ERROR: " + msg);
	process.exit(1);
};

const validateOptions = (company, namespace, slug, dir) => {
	if (/[^a-zA-Z0-9-]/.test(company) === true) {
		exit("NPM package namespace can only contain lowercase letters, numbers and hyphens");
	}

	if (!namespace) exit("No namespace specified!");
	if (/[^a-zA-Z0-9-]/.test(namespace) === true) {
		exit("Namespace can only contain lowercase letters, numbers and hyphens");
	}
	if (/^[^a-z]/.test(namespace) === true) exit("Namespace must start with a letter");
	if (/--/.test(namespace) === true) {
		exit("Namespace cannot contain two consecutive hyphens");
	}
	if (!slug) exit("No slug given!");
	if (/[^a-zA-Z0-9-]/.test(slug) === true) {
		exit("Block name can only contain lowercase letters, numbers and hyphens");
	}
	if (/^[^a-z]/.test(slug) === true) exit("Block name must start with a letter");
	if (/--/.test(slug) === true) {
		exit("Block name cannot contain two consecutive hyphens");
	}
	if (existsSync(dir)) exit("Block with this name already exists");
	return true;
};

const startApp = async () => {
	let company = await rl.question("What NPM package namespace should be used? (leave empty for none) ");
	company = company.replace(/^@/, "");

	const namespace = await rl.question("What library namespace would you like to use? ");
	const blockName = await rl.question("What is the name of the new block? ");
	rl.close();
	const slug = slugify(blockName);
	const dir = join(__dirname, `packages/${slug}`);

	const isValid = validateOptions(company, namespace, slug, dir);
	console.log(`Creating a new block as ${namespace}/${slug} with the name of "${blockName}"`);
	if (isValid) {
		mkdirSync(dir);
		mkdirSync(`${dir}/src`);
	}
	if (company) company = "@" + company + "/";
	else company = "";

	const stubs = walk(resolve(`${pkgRoot}/stubs/blocks`));
	for (const stub of stubs) {
		if (/\.stub$/i.test(stub) === false) continue;
		const relativePath = stub.replace(`${pkgRoot}/stubs/blocks/`, "");
		const overridePath = __dirname + "/stubs/" + relativePath;
		const resolvedSource = existsSync(overridePath) ? overridePath : stub;

		let contents = readFileSync(resolvedSource, "utf8");
		// e.g. "src/save.jsx"
		const outputPath = `${dir}/${relativePath.replace(/\.stub$/, "")}`;
		contents = contents
			.replace(/##company##/gi, company)
			.replace(/##namespace##/gi, namespace)
			.replace(/##block##/g, slug)
			.replace(/##name##/g, blockName);
		writeFileSync(outputPath, contents);
	}
	console.log(chalk.green("Complete"));
	process.exit(1);
};

startApp();
