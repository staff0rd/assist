import type { Ref, SyntheticEvent } from "react";
import type { SlashCommand } from "../../../../../../../slashCommands/readSlashCommands";
import { SlashTextField } from "../../../../../../slashSuggestions/SlashTextField";
import { handleEnterSubmit } from "../../../../../handleEnterSubmit";

const outline = ".MuiOutlinedInput-notchedOutline";

const promptSx = {
	"& .MuiOutlinedInput-root": {
		px: "18px",
		py: 2,
		minHeight: 92,
		alignItems: "flex-start",
		bgcolor: "transparent",
		borderRadius: 0,
		fontSize: 15,
	},
	[`&&& ${outline}`]: { border: 0 },
	"& textarea::placeholder": { color: "text.disabled", opacity: 1 },
} as const;

export function NewSessionPromptField({
	value,
	onChange,
	placeholder,
	inputRef,
	autoFocus,
	onTrack,
	commands,
}: {
	value: string;
	onChange: (prompt: string) => void;
	placeholder: string;
	inputRef: Ref<HTMLTextAreaElement>;
	autoFocus: boolean;
	onTrack: (e: SyntheticEvent) => void;
	commands: SlashCommand[];
}) {
	return (
		<SlashTextField
			commands={commands}
			sx={promptSx}
			value={value}
			onChange={onChange}
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
			slotProps={{ htmlInput: { "aria-label": "Prompt" } }}
		/>
	);
}
