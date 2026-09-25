import Box from "@mui/material/Box";
import { nextRateLimitStep } from "../../../../../../../../../shared/nextRateLimitStep";
import { rateLimitLevel } from "../../../../../../../../../shared/rateLimitLevel";
import { limitLevelColor } from "../../../limitLevelColor";
import { rateLimitRecoveryNote } from "./RateLimitTooltipRow/rateLimitRecoveryNote";
import { RateLimitThresholdSlot } from "./RateLimitTooltipRow/RateLimitThresholdSlot";

export function RateLimitTooltipRow({
	label,
	pct,
	resetsAt,
	windowSeconds,
	now,
}: {
	label: string;
	pct: number;
	resetsAt: number | undefined;
	windowSeconds: number;
	now: number;
}) {
	const level = rateLimitLevel(pct, resetsAt, windowSeconds, now);
	const next = nextRateLimitStep(pct, resetsAt, windowSeconds, now);
	const projected = next.kind === "projected" ? next : undefined;
	return (
		<Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
			<Box component="span" sx={{ minWidth: "2ch" }}>
				{label}
			</Box>
			<RateLimitThresholdSlot
				direction="back"
				threshold={projected?.recovery}
			/>
			<Box
				component="span"
				sx={{
					minWidth: "4ch",
					textAlign: "right",
					color: limitLevelColor(level),
				}}
			>
				{Math.round(pct)}%
			</Box>
			<RateLimitThresholdSlot
				direction="forward"
				threshold={projected?.worse}
			/>
			<Box component="span" sx={{ opacity: 0.6 }}>
				{projected
					? projected.recovery && rateLimitRecoveryNote(projected.recovery, now)
					: "no projection yet"}
			</Box>
		</Box>
	);
}
