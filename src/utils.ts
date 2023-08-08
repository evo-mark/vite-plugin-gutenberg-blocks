import crypto from "node:crypto";
import { parse, join } from "node:path";

export const generateFileHash = (contents: string) => crypto.createHash("md5").update(contents).digest("hex");

export const generatePhpAssetFile = (dependencies: Set<string> | string[] = [], hash = "") => {
	return `<?php return ["dependencies" => ${JSON.stringify(Array.from(dependencies))}, "version" => "${hash}"];`;
};

export const extractFilenameWithoutExtension = (path: string): string => {
	const parsed = parse(path);
	return join(parsed.dir, parsed.name);
};
