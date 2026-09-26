import Stack from "@mui/material/Stack";
import { type FormEvent, useRef } from "react";
import { launchNewSession } from "./NewSessionDialog/launchNewSession";
import { ModeRadioGroup } from "./NewSessionDialog/ModeRadioGroup";
import { NewSessionFooter } from "./NewSessionDialog/NewSessionFooter";
import { NewSessionPromptField } from "./NewSessionDialog/NewSessionPromptField";
import { newSessionModes } from "./NewSessionDialog/newSessionModes";
import { RepoCombobox } from "./NewSessionDialog/RepoCombobox";
import type { NewSessionDraft } from "./useNewSessionDraft";
import { AutoFocusDialog } from "../AutoFocusDialog";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";

export function NewSessionDialog({
	draft,
	onCreate,
	onCreateAssist,
	onClose,
}: {
	draft: NewSessionDraft;
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
	onClose: () => void;
}) {
	const { repos } = useRepoSelectionContext();
	const { prompt, cwd, mode } = draft;
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		launchNewSession(mode, prompt, cwd, { onCreate, onCreateAssist });
		draft.clear();
		onClose();
	};

	return (
		<AutoFocusDialog onClose={onClose} focusRef={inputRef} centered>
			<form onSubmit={submit}>
				<Stack spacing={1} sx={{ p: 1 }}>
					<NewSessionPromptField
						value={prompt}
						onChange={draft.setPrompt}
						placeholder={newSessionModes[mode].placeholder}
						inputRef={inputRef}
					/>
					<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
						<RepoCombobox repos={repos} value={cwd} onChange={draft.setCwd} />
						<ModeRadioGroup value={mode} onChange={draft.setMode} />
					</Stack>
				</Stack>
				<NewSessionFooter submitLabel={newSessionModes[mode].submitLabel} />
			</form>
		</AutoFocusDialog>
	);
}
