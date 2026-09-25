import Stack from "@mui/material/Stack";
import type { ConfigObjectListNode } from "../../../../../../../../shared/ConfigNode";
import { ConfigAddEntryButton } from "../ConfigAddEntryButton";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";
import { ConfigObjectListRow } from "./ConfigObjectListEditor/ConfigObjectListRow";
import { useConfigObjectList } from "./ConfigObjectListEditor/useConfigObjectList";

type Props = {
	node: ConfigObjectListNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigObjectListEditor({
	node,
	label,
	value,
	disabled,
	onChange,
	render,
}: Props) {
	const items = Array.isArray(value) ? value : [];
	const list = useConfigObjectList(items, onChange);

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start", width: "100%" }}>
			{items.map((item, index) => (
				<ConfigObjectListRow
					key={`[${index}]`}
					node={node.item}
					label={`${label}[${index}]`}
					value={item}
					open={list.isOpen(index)}
					disabled={disabled}
					render={render}
					onToggle={() => list.toggle(index)}
					onChange={(next) => list.replace(index, next)}
					onMoveUp={() => list.moveUp(index)}
					onMoveDown={() => list.moveDown(index)}
					onRemove={() => list.remove(index)}
				/>
			))}
			<ConfigAddEntryButton
				label={label}
				disabled={disabled}
				onClick={list.add}
			/>
		</Stack>
	);
}
