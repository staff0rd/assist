import Stack from "@mui/material/Stack";
import { type FormEvent, useRef, useState } from "react";
import { launchNewSession } from "./launchNewSession";
import { ModeRadioGroup } from "./ModeRadioGroup";
import { NewSessionFooter } from "./NewSessionFooter";
import { NewSessionPromptField } from "./NewSessionPromptField";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";
import { RepoCombobox } from "./RepoCombobox";
import { TopAnchoredDialog } from "./TopAnchoredDialog";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function NewSessionDialog({
	onCreate,
	onCreateAssist,
	onClose,
}: {
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
	onClose: () => void;
}) {
	const { repos, selectedCwd } = useRepoSelectionContext();
	const [prompt, setPrompt] = useState("");
	const [cwd, setCwd] = useState(selectedCwd);
	const [mode, setMode] = useState<NewSessionMode>("prompt");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		launchNewSession(mode, prompt, cwd, { onCreate, onCreateAssist });
		onClose();
	};

	return (
		<TopAnchoredDialog onClose={onClose} focusRef={inputRef}>
			<form onSubmit={submit}>
				<Stack spacing={1} sx={{ p: 1 }}>
					<NewSessionPromptField
						value={prompt}
						onChange={setPrompt}
						placeholder={newSessionModes[mode].placeholder}
						inputRef={inputRef}
					/>
					<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
						<RepoCombobox repos={repos} value={cwd} onChange={setCwd} />
						<ModeRadioGroup value={mode} onChange={setMode} />
					</Stack>
				</Stack>
				<NewSessionFooter submitLabel={newSessionModes[mode].submitLabel} />
			</form>
		</TopAnchoredDialog>
	);
}
