import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { type FormEvent, useRef, useState } from "react";
import { handleEnterSubmit } from "./handleEnterSubmit";
import { RepoCombobox } from "./RepoCombobox";
import { TopAnchoredDialog } from "./TopAnchoredDialog";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function NewSessionDialog({
	onCreate,
	onClose,
}: {
	onCreate: (prompt: string, cwd?: string) => void;
	onClose: () => void;
}) {
	const { repos, selectedCwd } = useRepoSelectionContext();
	const [prompt, setPrompt] = useState("");
	const [cwd, setCwd] = useState(selectedCwd);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		onCreate(prompt, cwd || undefined);
		onClose();
	};

	return (
		<TopAnchoredDialog onClose={onClose} focusRef={inputRef}>
			<Stack component="form" onSubmit={submit} spacing={1} sx={{ p: 1 }}>
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
				<RepoCombobox repos={repos} value={cwd} onChange={setCwd} />
			</Stack>
		</TopAnchoredDialog>
	);
}
