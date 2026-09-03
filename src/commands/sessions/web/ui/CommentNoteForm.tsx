import { TextField } from "@mui/material";
import { useState } from "react";
import { CommentNoteActions } from "./CommentNoteActions";

export function CommentNoteForm({
	onAdd,
	onAddRule,
	onCancel,
	onCollapse,
}: {
	onAdd: (note: string) => void;
	onAddRule?: ((note: string) => void) | undefined;
	onCancel: () => void;
	onCollapse?: (() => void) | undefined;
}) {
	const [note, setNote] = useState("");
	const trimmed = note.trim();
	const submit = () => {
		if (trimmed) onAdd(trimmed);
	};

	return (
		<>
			<TextField
				autoFocus
				multiline
				minRows={2}
				maxRows={8}
				size="small"
				placeholder="Add a note…"
				value={note}
				onChange={(e) => setNote(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						submit();
					}
				}}
			/>
			<CommentNoteActions
				disabled={trimmed.length === 0}
				onAdd={submit}
				onAddRule={onAddRule ? () => onAddRule(trimmed) : undefined}
				onCancel={onCancel}
				onCollapse={onCollapse}
			/>
		</>
	);
}
