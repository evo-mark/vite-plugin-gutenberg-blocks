import { useBlockProps } from "@wordpress/block-editor";

export default function Edit({ attributes, setAttributes, isSelected }) {
	const blockProps = useBlockProps();

	return [
		<div key="render" {...blockProps}>
			{/* Block goes here */}
		</div>,
	];
}
