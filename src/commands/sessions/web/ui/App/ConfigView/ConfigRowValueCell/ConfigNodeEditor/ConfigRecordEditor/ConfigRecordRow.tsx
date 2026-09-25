import Box from "@mui/material/Box";
import type { ConfigNode } from "../../../../../../../../../shared/ConfigNode";
import { ConfigEntryActions } from "../../ConfigEntryActions";
import type { ConfigNodeEditorRenderer } from "../ConfigNodeEditorRenderer";
import { ConfigRecordKeyCell } from "./ConfigRecordRow/ConfigRecordKeyCell";

type Props = {
	node: ConfigNode;
	label: string;
	name: string;
	position: number;
	value: unknown;
	disabled: boolean;
	keyValues?: string[];
	keyDescriptions?: Record<string, string>;
	taken?: string[];
	onRename: (name: string) => void;
	onChange: (value: unknown) => void;
	onRemove: () => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigRecordRow({
	node,
	label,
	name,
	position,
	value,
	disabled,
	keyValues,
	keyDescriptions,
	taken,
	onRename,
	onChange,
	onRemove,
	render: Render,
}: Props) {
	return (
		<Box sx={{ display: "flex", gap: 1, width: "100%" }}>
			<ConfigRecordKeyCell
				label={`${label} key ${position}`}
				name={name}
				disabled={disabled}
				keyValues={keyValues}
				keyDescriptions={keyDescriptions}
				taken={taken}
				onRename={onRename}
			/>
			<Render
				node={node}
				label={`${label}.${name}`}
				value={value}
				disabled={disabled}
				onChange={onChange}
			/>
			<ConfigEntryActions
				label={`${label} entry ${position}`}
				disabled={disabled}
				onRemove={onRemove}
			/>
		</Box>
	);
}
