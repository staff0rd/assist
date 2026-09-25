import Stack from "@mui/material/Stack";
import type { ConfigRecordNode } from "../../../../../../../../../../../../shared/ConfigNode";
import { asConfigRecord } from "../asConfigRecord";
import { ConfigAddEntryButton } from "../ConfigAddEntryButton";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";
import { ConfigRecordRow } from "./ConfigRecordEditor/ConfigRecordRow";
import { emptyConfigEntryValue } from "./ConfigRecordEditor/emptyConfigEntryValue";
import { removeConfigField, renameConfigField } from "./setConfigField";

type Props = {
	node: ConfigRecordNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigRecordEditor({
	node,
	label,
	value,
	disabled,
	onChange,
	render,
}: Props) {
	const record = asConfigRecord(value) ?? {};

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start", width: "100%" }}>
			{Object.entries(record).map(([name, entry], index) => (
				<ConfigRecordRow
					key={`entry-${index}`}
					node={node.value}
					label={label}
					name={name}
					position={index + 1}
					value={entry}
					disabled={disabled}
					keyValues={node.keyValues}
					keyDescriptions={node.keyDescriptions}
					taken={Object.keys(record)}
					render={render}
					onRename={(next) => onChange(renameConfigField(record, index, next))}
					onChange={(next) => onChange({ ...record, [name]: next })}
					onRemove={() => onChange(removeConfigField(record, index))}
				/>
			))}
			<ConfigAddEntryButton
				label={label}
				disabled={disabled}
				onClick={() => onChange({ ...record, "": emptyConfigEntryValue(node) })}
			/>
		</Stack>
	);
}
