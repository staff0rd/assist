import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import type { CheckResult } from "../../../../../../shared/askCheckInputSchema";

export function CheckActions({
	onResult,
	onDismiss,
}: {
	onResult: (result: CheckResult, note: string) => void;
	onDismiss: () => void;
}) {
	const [note, setNote] = useState("");
	return (
		<Stack spacing={1.5} sx={{ p: 2 }}>
			<TextField
				label="Note (optional)"
				placeholder="Anything the agent should know"
				multiline
				minRows={2}
				size="small"
				value={note}
				onChange={(event) => setNote(event.target.value)}
			/>
			<Stack direction="row" spacing={1}>
				<Button color="inherit" onClick={onDismiss} sx={{ mr: "auto" }}>
					Dismiss
				</Button>
				<Button
					color="error"
					variant="outlined"
					onClick={() => onResult("doesn't work", note)}
				>
					Doesn't work
				</Button>
				<Button
					color="success"
					variant="contained"
					onClick={() => onResult("works", note)}
				>
					Works
				</Button>
			</Stack>
		</Stack>
	);
}
