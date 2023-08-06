import crypto from "node:crypto";
import { basename, extname } from "node:path";

export const generateFileHash = (contents: string) => crypto.createHash("md5").update(contents).digest("hex");

export const generatePhpAssetFile = (dependencies: Set<string> | string[] = [], hash = "") => {
	return `<?php return ["dependencies" => ${JSON.stringify(Array.from(dependencies))}, "version" => "${hash}"];`;
};

export const extractFilenameWithoutExtension = (fullpath: string): string => {
	const filenameWithExt = basename(fullpath);
	const ext = extname(fullpath);
	const filenameWithoutExt = filenameWithExt.replace(ext, "");
	return filenameWithoutExt;
};
