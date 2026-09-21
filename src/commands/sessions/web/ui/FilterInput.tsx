import TextField from "@mui/material/TextField";
import type { KeyboardEvent, Ref } from "react";

export function FilterInput({
	inputRef,
	value,
	onChange,
	onKeyDown,
	placeholder,
	autoFocus,
}: {
	inputRef?: Ref<HTMLInputElement>;
	value: string;
	onChange: (value: string) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
	placeholder: string;
	autoFocus?: boolean;
}) {
	return (
		<TextField
			autoFocus={autoFocus}
			inputRef={inputRef}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			size="small"
			fullWidth
			slotProps={{ input: { sx: { fontSize: 12 } } }}
			sx={{ p: 0.5 }}
		/>
	);
}
