import TextField from "@mui/material/TextField";
import { ConfigRecordKeyInput } from "./ConfigRecordKeyCell/ConfigRecordKeyInput";

type Props = {
	label: string;
	name: string;
	disabled: boolean;
	keyValues?: string[];
	keyDescriptions?: Record<string, string>;
	taken?: string[];
	onRename: (name: string) => void;
};

export function ConfigRecordKeyCell({
	label,
	name,
	disabled,
	keyValues,
	keyDescriptions,
	taken,
	onRename,
}: Props) {
	if (keyValues) {
		return (
			<ConfigRecordKeyInput
				label={label}
				options={keyValues}
				descriptions={keyDescriptions}
				taken={taken ?? []}
				value={name}
				disabled={disabled}
				onChange={onRename}
			/>
		);
	}
	return (
		<TextField
			size="small"
			placeholder="key"
			value={name}
			disabled={disabled}
			slotProps={{ htmlInput: { "aria-label": label } }}
			onChange={(event) => onRename(event.target.value)}
			sx={{ minWidth: 180 }}
		/>
	);
}
