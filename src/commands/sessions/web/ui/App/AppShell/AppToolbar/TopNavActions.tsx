import Stack from "@mui/material/Stack";
import type { AssistLaunchMeta } from "../../../createSessionAction";
import { dispatchMode } from "../../dispatchMode";
import { ModeButtons } from "./TopNavActions/ModeButtons";
import { prLaunchMeta } from "../../prLaunchMeta";
import { PromptComposerDropdowns } from "./TopNavActions/PromptComposerDropdowns";
import { ReviewDropdown } from "./TopNavActions/ReviewDropdown";
import { ServerRunMenu } from "./TopNavActions/ServerRunMenu";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function TopNavActions({
	onCreate,
	onCreateDesign,
	onCreateHarness,
	onCreateAssist,
	onStartRun,
}: {
	onCreate: (prompt: string, cwd: string) => void;
	onCreateDesign: (prompt: string, cwd: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd: string) => void;
	onCreateAssist: (
		args: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
	onStartRun: (runName: string, cwd: string) => void;
}) {
	const { selectedCwd } = useRepoSelectionContext();
	const disabled = !selectedCwd;

	return (
		<Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
			<ModeButtons
				disabled={disabled}
				onSelect={(m, text) =>
					dispatchMode(m, selectedCwd, onCreateAssist, () => {}, text)
				}
			>
				<PromptComposerDropdowns
					cwd={selectedCwd}
					disabled={disabled}
					onCreate={onCreate}
					onCreateDesign={onCreateDesign}
					onCreateHarness={onCreateHarness}
				/>
				<ReviewDropdown
					cwd={selectedCwd}
					disabled={disabled}
					onSelect={(pr, args) =>
						onCreateAssist(
							[...args, String(pr.number)],
							selectedCwd,
							prLaunchMeta(pr),
						)
					}
				/>
			</ModeButtons>
			<ServerRunMenu onStartRun={onStartRun} cwd={selectedCwd} />
		</Stack>
	);
}
