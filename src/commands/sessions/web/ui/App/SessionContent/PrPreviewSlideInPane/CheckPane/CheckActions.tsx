import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import type { CheckResult } from "../../../../../../shared/askCheckInputSchema";
import { usePreviewPrimaryAction } from "../../../usePreviewPrimaryAction";

export function CheckActions({
	onResult,
	onDismiss,
}: {
	onResult: (result: CheckResult, note: string) => void;
	onDismiss: () => void;
}) {
	const [note, setNote] = useState("");
	const primary = usePreviewPrimaryAction();
	return (
		<>
			<TextField
				placeholder="Add a note for the agent (optional)"
				multiline
				minRows={2}
				size="small"
				value={note}
				onChange={(event) => setNote(event.target.value)}
				slotProps={{ htmlInput: { "aria-label": "Note" } }}
				sx={{ px: 2, pt: 1.5 }}
			/>
			<Stack
				direction="row"
				spacing={1}
				sx={{
					px: 2,
					py: 1.5,
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				<Button variant="tonal" onClick={onDismiss}>
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
					{...primary}
				>
					Works
				</Button>
			</Stack>
		</>
	);
}
