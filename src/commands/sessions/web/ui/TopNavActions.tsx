import Stack from "@mui/material/Stack";
import { dispatchMode } from "./dispatchMode";
import { FreePromptDropdown } from "./FreePromptDropdown";
import { ModeButtons } from "./ModeButtons";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function TopNavActions({
	onCreate,
	onCreateAssist,
}: {
	onCreate: (prompt: string, cwd: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
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
			/>
			<FreePromptDropdown
				disabled={disabled}
				onSubmit={(prompt) => onCreate(prompt, selectedCwd)}
			/>
		</Stack>
	);
}
