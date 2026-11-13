import { Button, Stack } from "@mui/material";
import { useState } from "react";
import { SessionSlashTextField } from "../../../../../slashSuggestions/SessionSlashTextField";

export function QueuedCommentEditor({
	initial,
	label,
	onSave,
	onCancel,
}: {
	initial: string;
	label: string;
	onSave: (note: string) => void;
	onCancel: () => void;
}) {
	const [note, setNote] = useState(initial);
	const trimmed = note.trim();
	const save = () => {
		if (trimmed.length > 0) onSave(trimmed);
	};
	return (
		<Stack spacing={0.5} sx={{ mt: 0.5 }}>
			<SessionSlashTextField
				autoFocus
				multiline
				minRows={2}
				maxRows={8}
				size="small"
				value={note}
				onChange={setNote}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						save();
					} else if (e.key === "Escape") {
						e.preventDefault();
						e.stopPropagation();
						onCancel();
					}
				}}
				slotProps={{ htmlInput: { "aria-label": label } }}
			/>
			<Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
				<Button size="small" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="small"
					variant="contained"
					disabled={trimmed.length === 0}
					onClick={save}
				>
					Save
				</Button>
			</Stack>
		</Stack>
	);
}
