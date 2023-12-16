import { registerBlockType } from "@wordpress/blocks";

import edit from "./edit";
import save from "./save";

registerBlockType("example/example-block", {
	edit,
	save,
	attributes: {},
});
