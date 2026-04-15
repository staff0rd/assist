import { MODES, modeButtonStyle, type SessionMode } from "./buildPrompt";
import { RunButton } from "./RunButton";
import type { RunConfigInfo } from "./types";

const MAX_VISIBLE_RUNS = 10;

export function ModeSelector({
	mode,
	onSelectMode,
	runConfigs,
	totalRunCount,
	selectedRun,
	onSelectRun,
}: {
	mode: SessionMode;
	onSelectMode: (mode: SessionMode) => void;
	runConfigs: RunConfigInfo[];
	totalRunCount: number;
	selectedRun: string | null;
	onSelectRun: (name: string | null) => void;
}) {
	const visible = runConfigs.slice(0, MAX_VISIBLE_RUNS);
	const hiddenCount = totalRunCount - visible.length;

	return (
		<div
			style={{
				display: "flex",
				gap: 4,
				flexWrap: "wrap",
				alignItems: "center",
			}}
		>
			{MODES.map((m) => (
				<button
					key={m.value}
					type="button"
					onClick={() => {
						onSelectRun(null);
						onSelectMode(m.value);
					}}
					style={modeButtonStyle(!selectedRun && mode === m.value)}
				>
					{m.label}
				</button>
			))}
			{visible.map((c) => (
				<RunButton
					key={c.name}
					config={c}
					active={selectedRun === c.name}
					onClick={() => onSelectRun(c.name)}
				/>
			))}
			{hiddenCount > 0 && (
				<span style={{ fontSize: 11, color: "#888" }}>+{hiddenCount} more</span>
			)}
		</div>
	);
}
