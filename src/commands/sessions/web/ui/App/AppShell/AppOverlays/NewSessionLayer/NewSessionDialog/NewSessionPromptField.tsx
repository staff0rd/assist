import TextField from "@mui/material/TextField";
import type { RefObject } from "react";
import { handleEnterSubmit } from "../../../../handleEnterSubmit";

export function NewSessionPromptField({
	value,
	onChange,
	placeholder,
	inputRef,
}: {
	value: string;
	onChange: (prompt: string) => void;
	placeholder: string;
	inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
	return (
		<TextField
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={handleEnterSubmit}
			inputRef={inputRef}
			placeholder={placeholder}
			autoFocus
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
