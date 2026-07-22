import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

export function CommentNoteForm({
	onAdd,
	onCancel,
}: {
	onAdd: (note: string) => void;
	onCancel: () => void;
}) {
	const [note, setNote] = useState("");
	const submit = () => {
		const trimmed = note.trim();
		if (trimmed) onAdd(trimmed);
	};

	return (
		<>
			<TextField
				autoFocus
				multiline
				minRows={2}
				size="small"
				placeholder="Add a note…"
				value={note}
				onChange={(e) => setNote(e.target.value)}
				onKeyDown={(e) => {
					if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
						e.preventDefault();
						submit();
					}
				}}
			/>
			<Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
				<Button size="small" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="small"
					variant="contained"
					disabled={note.trim().length === 0}
					onClick={submit}
				>
					Add comment
				</Button>
			</Stack>
		</>
	);
}
