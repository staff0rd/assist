import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { contextLevel } from "../../../../shared/contextLevel";
import type { SessionStatus } from "./types";

const STATUS_COLORS: Record<SessionStatus, string> = {
	running: "success.main",
	waiting: "warning.main",
	done: "info.main",
	error: "error.main",
};

function contextColor(pct: number): string {
	switch (contextLevel(pct)) {
		case "red":
			return "error.main";
		case "yellow":
			return "warning.main";
		default:
			return "text.disabled";
	}
}

export function StatusRow({
	status,
	elapsed,
	restored,
	usedPct,
}: {
	status: SessionStatus;
	elapsed: string;
	restored?: boolean;
	usedPct?: number;
}) {
	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<Typography variant="caption" sx={{ color: STATUS_COLORS[status] }}>
					● {status}
				</Typography>
				{restored !== undefined && (
					<Typography
						variant="caption"
						sx={{ color: restored ? "success.main" : "warning.main" }}
					>
						{restored ? "restored" : "not restored"}
					</Typography>
				)}
				{usedPct !== undefined && (
					<Typography
						variant="caption"
						sx={{
							color: contextColor(usedPct),
							opacity: 0.6,
							fontSize: "0.8rem",
						}}
					>
						{Math.round(usedPct)}%
					</Typography>
				)}
			</Box>
			<Typography variant="caption" color="text.disabled">
				{elapsed}
			</Typography>
		</Box>
	);
}
