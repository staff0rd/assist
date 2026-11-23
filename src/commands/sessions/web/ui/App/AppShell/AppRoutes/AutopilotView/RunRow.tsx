import Box from "@mui/material/Box";
import type { AutopilotRun } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { statusPillSx } from "../../../../designSystem/statusPillSx";
import { clockTime } from "./clockTime";
import { itemRowSx } from "./itemRowSx";
import { RunningActions } from "./RunningActions";

export function RunRow({
	run,
	prompt,
	busy,
	onStop,
	onOpen,
}: {
	run: AutopilotRun;
	prompt: string;
	busy: boolean;
	onStop: () => void;
	onOpen: () => void;
}) {
	return (
		<Box sx={itemRowSx.row}>
			<Box sx={itemRowSx.title}>
				<Box component="span" sx={itemRowSx.mono}>
					{prompt}
				</Box>
				<Box component="span" sx={{ fontWeight: 500 }}>
					Autopilot run
				</Box>
				<Box component="span" sx={statusPillSx("primary.main")}>
					choosing an item
				</Box>
			</Box>
			<Box sx={itemRowSx.line}>
				Started {clockTime(run.startedAt)}; no backlog item started yet.
			</Box>
			<Box sx={itemRowSx.side}>
				<RunningActions busy={busy} onStop={onStop} onOpen={onOpen} />
			</Box>
		</Box>
	);
}
