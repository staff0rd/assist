import Box from "@mui/material/Box";
import type { ConfigNode } from "../../../../../../../../../../../../../shared/ConfigNode";
import { ConfigEntryActions } from "../../ConfigEntryActions";
import { ConfigEntryBlock } from "../../ConfigEntryBlock";
import { configEntrySummary } from "../../configEntrySummary";
import type { ConfigNodeEditorRenderer } from "../ConfigNodeEditorRenderer";
import { ConfigScalarText } from "../../ConfigScalarText";

type Props = {
	node: ConfigNode;
	label: string;
	value: unknown;
	open: boolean;
	disabled: boolean;
	onToggle: () => void;
	onChange: (value: unknown) => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove: () => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigObjectListRow({
	node,
	label,
	value,
	open,
	disabled,
	onToggle,
	onChange,
	onMoveUp,
	onMoveDown,
	onRemove,
	render: Render,
}: Props) {
	return (
		<Box sx={{ display: "flex", gap: 1, width: "100%", alignItems: "center" }}>
			{open ? (
				<ConfigEntryBlock>
					<Render
						node={node}
						label={label}
						value={value}
						disabled={disabled}
						onChange={onChange}
					/>
				</ConfigEntryBlock>
			) : (
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<ConfigScalarText value={configEntrySummary(node, value)} />
				</Box>
			)}
			<ConfigEntryActions
				label={label}
				disabled={disabled}
				open={open}
				onToggle={onToggle}
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
				onRemove={onRemove}
			/>
		</Box>
	);
}
