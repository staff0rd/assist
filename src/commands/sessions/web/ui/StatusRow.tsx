import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SessionStatus } from "./types";

const STATUS_COLORS: Record<SessionStatus, string> = {
	running: "success.main",
	waiting: "warning.main",
	done: "info.main",
};

export function StatusRow({
	status,
	elapsed,
	restored,
}: {
	status: SessionStatus;
	elapsed: string;
	restored?: boolean;
}) {
	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
			<Box sx={{ display: "flex", gap: 1 }}>
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
			</Box>
			<Typography variant="caption" color="text.disabled">
				{elapsed}
			</Typography>
		</Box>
	);
}
