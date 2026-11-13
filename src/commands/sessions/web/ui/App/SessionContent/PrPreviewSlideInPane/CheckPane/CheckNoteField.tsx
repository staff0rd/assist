import { SessionSlashTextField } from "../../../../slashSuggestions/SessionSlashTextField";

export function CheckNoteField({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<SessionSlashTextField
			placeholder="Add a note for the agent (optional)"
			multiline
			minRows={2}
			size="small"
			value={value}
			onChange={onChange}
			slotProps={{ htmlInput: { "aria-label": "Note" } }}
			sx={{ px: 2, pt: 1.5 }}
		/>
	);
}
