import Stack from "@mui/material/Stack";
import type { ComponentProps } from "react";
import { NewSessionPromptField } from "./NewSessionPromptField";
import { NewSessionSelectors } from "./NewSessionSelectors";
import { newSessionModes } from "./newSessionModes";
import { RepoCombobox } from "./RepoCombobox";
import { useRepoSelectionContext } from "../../../../../useRepoSelectionContext";

export function NewSessionFields(
	props: ComponentProps<typeof NewSessionSelectors>,
) {
	const { draft, focus } = props;
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
				<NewSessionSelectors {...props} />
			</Stack>
		</Stack>
	);
}
