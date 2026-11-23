import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { ItemTitle } from "./ItemTitle";
import { itemRowSx } from "./itemRowSx";
import { phaseProgress } from "./phaseProgress";
import { RemainingPhases } from "./RemainingPhases";
import { RunningActions } from "./RunningActions";

const barSx = { width: 120, height: 4, borderRadius: 1 } as const;

export function RunningRow({
	item,
	cwd,
	busy,
	onStop,
	onOpen,
}: {
	item: AutopilotItemView;
	cwd: string;
	busy: boolean;
	onStop: () => void;
	onOpen: () => void;
}) {
	const label = `phase ${item.phase} of ${item.totalPhases}`;
	return (
		<Box sx={itemRowSx.row}>
			<ItemTitle item={item} cwd={cwd} pill={label} pillColor="primary.main" />
			<Box sx={itemRowSx.line}>{item.why ?? "No why line recorded."}</Box>
			<Box sx={itemRowSx.side}>
				<LinearProgress
					variant="determinate"
					value={phaseProgress(item)}
					aria-label={label}
					sx={barSx}
				/>
				<RunningActions busy={busy} onStop={onStop} onOpen={onOpen} />
			</Box>
			<RemainingPhases remaining={item.remaining} />
		</Box>
	);
}
