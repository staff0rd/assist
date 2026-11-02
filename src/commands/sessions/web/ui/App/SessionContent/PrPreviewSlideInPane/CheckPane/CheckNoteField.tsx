import { TextField } from "@mui/material";

export function CheckNoteField({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<TextField
			placeholder="Add a note for the agent (optional)"
			multiline
			minRows={2}
			size="small"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			slotProps={{ htmlInput: { "aria-label": "Note" } }}
			sx={{ px: 2, pt: 1.5 }}
		/>
	);
}
