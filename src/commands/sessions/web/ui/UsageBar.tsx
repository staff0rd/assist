import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import type { RateLimitLevel } from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";

const LEVEL_BAR_COLOR: Record<RateLimitLevel, "success" | "warning" | "error"> =
	{
		ok: "success",
		warn: "warning",
		over: "error",
	};

/** A determinate usage bar with its rounded percentage, coloured by rate-limit level. */
export function UsageBar({
	percentage,
	level,
}: {
	percentage: number;
	level: RateLimitLevel;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<LinearProgress
				variant="determinate"
				value={Math.min(100, percentage)}
				color={LEVEL_BAR_COLOR[level]}
				sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
			/>
			<Box
				sx={{ minWidth: 40, textAlign: "right", color: limitLevelColor(level) }}
			>
				{Math.round(percentage)}%
			</Box>
		</Box>
	);
}
