import Stack from "@mui/material/Stack";
import type { AssistLaunchMeta } from "./createSessionAction";
import { dispatchMode } from "./dispatchMode";
import { ModeButtons } from "./ModeButtons";
import { prLaunchMeta } from "./prLaunchMeta";
import { PromptComposerDropdowns } from "./PromptComposerDropdowns";
import { ReviewDropdown } from "./ReviewDropdown";
import { ServerRunMenu } from "./ServerRunMenu";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function TopNavActions({
	onCreate,
	onCreateDesign,
	onCreatePi,
	onCreateAssist,
	onStartRun,
}: {
	onCreate: (prompt: string, cwd: string) => void;
	onCreateDesign: (prompt: string, cwd: string) => void;
	onCreatePi: (prompt: string, cwd: string) => void;
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
					onCreatePi={onCreatePi}
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
