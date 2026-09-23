import TextField from "@mui/material/TextField";
import { type FormEvent, useRef, useState } from "react";
import { handleEnterSubmit } from "./handleEnterSubmit";
import { TopAnchoredDialog } from "./TopAnchoredDialog";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function NewSessionDialog({
	onCreate,
	onClose,
}: {
	onCreate: (prompt: string, cwd?: string) => void;
	onClose: () => void;
}) {
	const { selectedCwd } = useRepoSelectionContext();
	const [prompt, setPrompt] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		onCreate(prompt, selectedCwd || undefined);
		onClose();
	};

	return (
		<TopAnchoredDialog onClose={onClose} focusRef={inputRef}>
			<form onSubmit={submit}>
				<TextField
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={handleEnterSubmit}
					inputRef={inputRef}
					placeholder="What should Claude do?"
					autoFocus
					fullWidth
					multiline
					minRows={3}
					maxRows={12}
					slotProps={{ input: { sx: { fontSize: 14 } } }}
				/>
			</form>
		</TopAnchoredDialog>
	);
}
