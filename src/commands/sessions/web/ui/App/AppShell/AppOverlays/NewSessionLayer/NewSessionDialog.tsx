import Stack from "@mui/material/Stack";
import { type FormEvent, useRef, useState } from "react";
import { launchNewSession } from "./NewSessionDialog/launchNewSession";
import { ModeRadioGroup } from "./NewSessionDialog/ModeRadioGroup";
import { NewSessionFooter } from "./NewSessionDialog/NewSessionFooter";
import { NewSessionPromptField } from "./NewSessionDialog/NewSessionPromptField";
import {
	type NewSessionMode,
	newSessionModes,
} from "./NewSessionDialog/newSessionModes";
import { RepoCombobox } from "./NewSessionDialog/RepoCombobox";
import { AutoFocusDialog } from "../AutoFocusDialog";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";

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
		<AutoFocusDialog onClose={onClose} focusRef={inputRef} centered>
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
		</AutoFocusDialog>
	);
}
