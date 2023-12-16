import type { InputOptions, ExternalOption } from "rollup";
import { wordpressMatch, external } from "./outputOptions.js";

export function options(options: InputOptions) {
	if (Array.isArray(options.external) === false) {
		// If string, RegExp or function
		options.external = [options.external].filter(Boolean) as ExternalOption;
	}

	if (Array.isArray(options.external)) {
		options.external = options.external.concat(Object.keys(external));
		options.external.push(wordpressMatch);
	}

	return options;
}
