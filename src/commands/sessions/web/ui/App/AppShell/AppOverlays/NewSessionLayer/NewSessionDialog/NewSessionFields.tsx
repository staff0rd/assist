import Stack from "@mui/material/Stack";
import { ModeRadioGroup } from "./ModeRadioGroup";
import { NewSessionPromptField } from "./NewSessionPromptField";
import { newSessionModes } from "./newSessionModes";
import { RepoCombobox } from "./RepoCombobox";
import type { useDraftFocus } from "./useDraftFocus";
import type { NewSessionDraft } from "../useNewSessionDraft";
import { useRepoSelectionContext } from "../../../../../useRepoSelectionContext";

export function NewSessionFields({
	draft,
	focus,
}: {
	draft: NewSessionDraft;
	focus: ReturnType<typeof useDraftFocus>;
}) {
	const { repos } = useRepoSelectionContext();

	return (
		<Stack spacing={1} sx={{ p: 1 }}>
			<NewSessionPromptField
				value={draft.prompt}
				onChange={draft.setPrompt}
				placeholder={newSessionModes[draft.mode].placeholder}
				inputRef={focus.promptRef}
				autoFocus={focus.autoFocus === "prompt"}
				onTrack={focus.trackPrompt}
			/>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
				<RepoCombobox
					repos={repos}
					value={draft.cwd}
					onChange={draft.setCwd}
					inputRef={focus.repoRef}
					autoFocus={focus.autoFocus === "repo"}
					onTrack={focus.trackRepo}
				/>
				<ModeRadioGroup
					value={draft.mode}
					onChange={draft.setMode}
					groupRef={focus.modeRef}
					autoFocus={focus.autoFocus === "mode"}
					onTrack={focus.trackMode}
				/>
			</Stack>
		</Stack>
	);
}
