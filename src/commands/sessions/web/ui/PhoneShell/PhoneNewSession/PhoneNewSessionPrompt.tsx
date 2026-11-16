import InputBase from "@mui/material/InputBase";
import { useSlashSuggestions } from "../../slashSuggestions/useSlashSuggestions";
import { useSuggestedSlashCommands } from "../../slashSuggestions/useSuggestedSlashCommands";
import { PhoneSlashSuggestions } from "../PhoneSlashSuggestions/PhoneSlashSuggestions";
import type { PhoneNewSession } from "./usePhoneNewSession";

const promptSx = {
	mx: 2,
	my: 1.25,
	minHeight: 120,
	alignItems: "flex-start",
	px: 1.75,
	py: 1.5,
	borderRadius: "12px",
	border: 1,
	borderColor: "divider",
	bgcolor: "background.default",
	fontSize: 16,
	lineHeight: 1.4,
	"&.Mui-focused": { borderColor: "primary.main" },
} as const;

const suggestionsSx = { order: 0, borderBottom: 1, borderColor: "divider" };

export function PhoneNewSessionPrompt({
	form,
	placeholder,
}: {
	form: PhoneNewSession;
	placeholder: string;
}) {
	const node = form.nodes.length > 0 ? form.node : undefined;
	const commands = useSuggestedSlashCommands(form.harness, form.cwd, node);
	const slash = useSlashSuggestions(commands, form.prompt, form.setPrompt);
	return (
		<>
			<InputBase
				multiline
				minRows={4}
				maxRows={10}
				value={form.prompt}
				inputRef={slash.inputRef}
				onChange={(e) => slash.edit(e.target)}
				onSelect={(e) => slash.trackCursor(e.target as HTMLTextAreaElement)}
				placeholder={placeholder}
				sx={promptSx}
				inputProps={{ "aria-label": "Prompt" }}
			/>
			{slash.suggestions && (
				<PhoneSlashSuggestions
					matches={slash.suggestions.matches}
					query={slash.suggestions.query}
					onPick={slash.pick}
					sx={suggestionsSx}
				/>
			)}
		</>
	);
}
