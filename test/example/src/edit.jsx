import { useBlockProps } from "@wordpress/block-editor";

import "./editor-style.css";

export default function Edit({ attributes, setAttributes, isSelected }) {
    const blockProps = useBlockProps();

	return [
		<div key="render" {...blockProps}>
			// Block goes here
		</div>,
	];
}
