import Box from "@mui/material/Box";
import type { ConfigNode } from "../../../../../../../../../shared/ConfigNode";
import { ConfigEntryBlock } from "../../ConfigEntryBlock";
import { configEntrySummary } from "../../configEntrySummary";
import { ConfigNodeEditor } from "../../ConfigNodeEditor";
import { ConfigScalarText } from "../../ConfigScalarText";

type Props = {
	node: ConfigNode;
	label: string;
	value: unknown;
	open: boolean;
	disabled: boolean;
	onChange: (value: unknown) => void;
};

export function ConfigArrayItemBody({
	node,
	label,
	value,
	open,
	disabled,
	onChange,
}: Props) {
	if (!open)
		return (
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<ConfigScalarText value={configEntrySummary(node, value)} />
			</Box>
		);

	return (
		<ConfigEntryBlock>
			<ConfigNodeEditor
				node={node}
				label={label}
				value={value}
				disabled={disabled}
				onChange={onChange}
			/>
		</ConfigEntryBlock>
	);
}
