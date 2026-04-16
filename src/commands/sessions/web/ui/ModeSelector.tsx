import Stack from "@mui/material/Stack";
import type { SessionMode } from "./dispatchMode";
import { ModeButtons } from "./ModeButtons";
import { RunButtons } from "./RunButtons";
import type { RunConfigInfo } from "./types";

const MAX_VISIBLE_RUNS = 10;

export function ModeSelector({
	onSelectMode,
	runConfigs,
	totalRunCount,
	selectedRun,
	onSelectRun,
}: {
	onSelectMode: (mode: SessionMode) => void;
	runConfigs: RunConfigInfo[];
	totalRunCount: number;
	selectedRun: string | null;
	onSelectRun: (name: string | null) => void;
}) {
	const visible = runConfigs.slice(0, MAX_VISIBLE_RUNS);

	const handleModeSelect = (m: SessionMode) => {
		onSelectRun(null);
		onSelectMode(m);
	};

	return (
		<Stack
			direction="row"
			spacing={0.5}
			sx={{ flexWrap: "wrap", alignItems: "center" }}
		>
			<ModeButtons onSelect={handleModeSelect} />
			<RunButtons
				configs={visible}
				selectedRun={selectedRun}
				onSelectRun={onSelectRun}
				hiddenCount={totalRunCount - visible.length}
			/>
		</Stack>
	);
}
