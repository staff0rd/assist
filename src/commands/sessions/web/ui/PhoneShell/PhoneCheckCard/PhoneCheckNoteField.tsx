import InputBase from "@mui/material/InputBase";
import { phoneFieldSx } from "../phoneFieldSx";

export function PhoneCheckNoteField({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<InputBase
			multiline
			minRows={2}
			maxRows={5}
			placeholder="Add a note for the agent (optional)"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			inputProps={{ "aria-label": "Note" }}
			sx={phoneFieldSx}
		/>
	);
}
