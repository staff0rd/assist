import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { useState } from "react";
import type { CheckResult } from "../../../../shared/askCheckInputSchema";

const fieldSx = {
	width: "100%",
	px: 1.5,
	py: 1,
	borderRadius: "10px",
	border: 1,
	borderColor: "divider",
	bgcolor: "background.default",
	fontSize: 16,
	"&.Mui-focused": { borderColor: "primary.main" },
} as const;

const buttonSx = { borderRadius: "12px", flex: 1 } as const;

export function PhoneCheckActions({
	onResult,
}: {
	onResult: (result: CheckResult, note: string) => void;
}) {
	const [note, setNote] = useState("");
	const [sending, setSending] = useState(false);
	const send = (result: CheckResult) => {
		setSending(true);
		onResult(result, note);
	};
	return (
		<>
			<InputBase
				multiline
				minRows={2}
				maxRows={5}
				placeholder="Add a note for the agent (optional)"
				value={note}
				onChange={(event) => setNote(event.target.value)}
				inputProps={{ "aria-label": "Note" }}
				sx={fieldSx}
			/>
			<Box sx={{ display: "flex", gap: 1 }}>
				<Button
					variant="outlined"
					color="error"
					sx={buttonSx}
					disabled={sending}
					onClick={() => send("doesn't work")}
				>
					Doesn't work
				</Button>
				<Button
					variant="contained"
					color="success"
					disableElevation
					sx={buttonSx}
					disabled={sending}
					onClick={() => send("works")}
				>
					Works
				</Button>
			</Box>
		</>
	);
}
