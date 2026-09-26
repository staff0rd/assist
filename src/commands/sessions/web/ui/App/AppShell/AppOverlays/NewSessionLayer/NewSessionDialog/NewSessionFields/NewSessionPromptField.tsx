import TextField from "@mui/material/TextField";
import type { Ref, SyntheticEvent } from "react";
import { handleEnterSubmit } from "../../../../../handleEnterSubmit";

export function NewSessionPromptField({
	value,
	onChange,
	placeholder,
	inputRef,
	autoFocus,
	onTrack,
}: {
	value: string;
	onChange: (prompt: string) => void;
	placeholder: string;
	inputRef: Ref<HTMLTextAreaElement>;
	autoFocus: boolean;
	onTrack: (e: SyntheticEvent) => void;
}) {
	return (
		<TextField
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={handleEnterSubmit}
			onFocus={onTrack}
			onSelect={onTrack}
			inputRef={inputRef}
			placeholder={placeholder}
			autoFocus={autoFocus}
			fullWidth
			multiline
			minRows={3}
			maxRows={12}
			slotProps={{
				htmlInput: { "aria-label": "Prompt" },
				input: { sx: { fontSize: 14 } },
			}}
		/>
	);
}
