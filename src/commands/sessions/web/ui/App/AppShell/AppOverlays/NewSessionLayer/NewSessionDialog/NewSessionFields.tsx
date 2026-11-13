import Stack from "@mui/material/Stack";
import type { ComponentProps } from "react";
import { useSuggestedSlashCommands } from "../../../../../slashSuggestions/useSuggestedSlashCommands";
import type { NodeClone } from "../../../../../useNodeClones";
import { useRepoSelectionContext } from "../../../../../useRepoSelectionContext";
import { MachineSelector } from "./NewSessionFields/MachineSelector";
import { NewSessionFieldsLayout } from "./NewSessionFields/NewSessionFieldsLayout";
import { NewSessionPromptField } from "./NewSessionFields/NewSessionPromptField";
import { NewSessionSelectors } from "./NewSessionFields/NewSessionSelectors";
import { newSessionModes } from "../newSessionModes";
import { RepoCombobox } from "./NewSessionFields/RepoCombobox";

export function NewSessionFields({
	cloneState,
	...props
}: ComponentProps<typeof NewSessionSelectors> & {
	cloneState: (node: string | undefined) => NodeClone;
}) {
	const { draft, focus } = props;
	const { repos } = useRepoSelectionContext();
	const commands = useSuggestedSlashCommands(
		props.harness,
		draft.cwd,
		draft.node,
	);
	return (
		<NewSessionFieldsLayout
			prompt={
				<NewSessionPromptField
					value={draft.prompt}
					onChange={draft.setPrompt}
					placeholder={newSessionModes[draft.mode].placeholder}
					inputRef={focus.promptRef}
					autoFocus={focus.autoFocus === "prompt"}
					onTrack={focus.trackPrompt}
					commands={commands}
				/>
			}
		>
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
			<MachineSelector
				value={draft.node}
				onChange={draft.setNode}
				cloneState={cloneState}
			/>
		</NewSessionFieldsLayout>
	);
}
