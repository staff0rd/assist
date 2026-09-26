import Stack from "@mui/material/Stack";
import type { ComponentProps } from "react";
import type { NodeClone } from "../../../../../useNodeClones";
import { useRepoSelectionContext } from "../../../../../useRepoSelectionContext";
import { MachineSelector } from "./MachineSelector";
import { NewSessionPromptField } from "./NewSessionPromptField";
import { NewSessionSelectors } from "./NewSessionSelectors";
import { newSessionModes } from "./newSessionModes";
import { RepoCombobox } from "./RepoCombobox";

export function NewSessionFields({
	cloneState,
	...props
}: ComponentProps<typeof NewSessionSelectors> & {
	cloneState: (node: string | undefined) => NodeClone;
}) {
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
			<MachineSelector
				value={draft.node}
				onChange={draft.setNode}
				cloneState={cloneState}
			/>
		</Stack>
	);
}
