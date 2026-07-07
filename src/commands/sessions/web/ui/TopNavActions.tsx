import Stack from "@mui/material/Stack";
import type { AssistLaunchMeta } from "./createSessionAction";
import { dispatchMode } from "./dispatchMode";
import { formatRelativeTime } from "./formatRelativeTime";
import { FreePromptDropdown } from "./FreePromptDropdown";
import { ModeButtons } from "./ModeButtons";
import { ReviewDropdown } from "./ReviewDropdown";
import { reviewModeArgs } from "./reviewModeArgs";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function TopNavActions({
	onCreate,
	onCreateAssist,
}: {
	onCreate: (prompt: string, cwd: string) => void;
	onCreateAssist: (
		args: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
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
				<FreePromptDropdown
					allowEmpty
					disabled={disabled}
					onSubmit={(prompt) => onCreate(prompt, selectedCwd)}
				/>
				<ReviewDropdown
					cwd={selectedCwd}
					disabled={disabled}
					onSelect={(pr, mode) =>
						onCreateAssist(
							[...reviewModeArgs(mode), String(pr.number)],
							selectedCwd,
							{
								title: pr.title,
								subtitle: `#${pr.number} · ${pr.author} · ${formatRelativeTime(
									pr.createdAt,
								)}`,
							},
						)
					}
				/>
			</ModeButtons>
		</Stack>
	);
}
