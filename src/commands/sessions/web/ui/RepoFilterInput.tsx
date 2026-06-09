import TextField from "@mui/material/TextField";
import type { KeyboardEvent, Ref } from "react";

export function RepoFilterInput({
	inputRef,
	value,
	onChange,
	onKeyDown,
}: {
	inputRef: Ref<HTMLInputElement>;
	value: string;
	onChange: (value: string) => void;
	onKeyDown: (e: KeyboardEvent) => void;
}) {
	return (
		<TextField
			inputRef={inputRef}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={onKeyDown}
			placeholder="Filter repos..."
			size="small"
			fullWidth
			slotProps={{ input: { sx: { fontSize: 12 } } }}
			sx={{ p: 0.5 }}
		/>
	);
}
