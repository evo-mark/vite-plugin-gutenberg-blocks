import crypto from "node:crypto";

export function generateBundle(options, bundle) {
	let hash;
	const imports = Object.values(bundle).reduce((acc, file) => {
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
	});
}
