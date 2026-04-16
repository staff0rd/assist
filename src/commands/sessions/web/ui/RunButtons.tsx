import Typography from "@mui/material/Typography";
import { RunButton } from "./RunButton";
import type { RunConfigInfo } from "./types";

export function RunButtons({
	configs,
	selectedRun,
	onSelectRun,
	hiddenCount,
}: {
	configs: RunConfigInfo[];
	selectedRun: string | null;
	onSelectRun: (name: string | null) => void;
	hiddenCount: number;
}) {
	return (
		<>
			{configs.map((c) => (
				<RunButton
					key={c.name}
					config={c}
					active={selectedRun === c.name}
					onClick={() => onSelectRun(c.name)}
				/>
			))}
			{hiddenCount > 0 && (
				<Typography variant="caption" color="text.disabled">
					+{hiddenCount} more
				</Typography>
			)}
		</>
	);
}
