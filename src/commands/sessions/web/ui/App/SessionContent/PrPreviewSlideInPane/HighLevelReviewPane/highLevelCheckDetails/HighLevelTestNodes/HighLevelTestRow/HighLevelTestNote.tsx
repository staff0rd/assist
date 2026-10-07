import { TextField } from "@mui/material";

export function HighLevelTestNote({
	name,
	note,
	indent,
	autoFocus,
	onNote,
}: {
	name: string;
	note: string;
	indent: string;
	autoFocus: boolean;
	onNote: (note: string) => void;
}) {
	return (
		<TextField
			variant="standard"
			size="small"
			fullWidth
			multiline
			autoFocus={autoFocus}
			value={note}
			onChange={(e) => onNote(e.target.value)}
			placeholder="Comment on this test"
			slotProps={{ htmlInput: { "aria-label": `Comment for ${name}` } }}
			sx={{
				pl: `calc(${indent} + 20px)`,
				"& .MuiInputBase-input": { fontSize: 12 },
			}}
		/>
	);
}
