import Box from "@mui/material/Box";
import type { RateLimitLevel } from "../../../../../../../../../../shared/rateLimitLevel";
import { limitLevelColor } from "../../../../../limitLevelColor";

export function RateLimitThresholdSlot({
	direction,
	threshold,
}: {
	direction: "back" | "forward";
	threshold: { level: RateLimitLevel; pct: number } | undefined;
}) {
	const back = direction === "back";
	const slotSx = {
		display: "inline-flex",
		gap: 0.5,
		minWidth: "6ch",
		justifyContent: back ? "flex-end" : "flex-start",
	};
	if (!threshold) return <Box component="span" sx={slotSx} />;
	const arrow = (
		<Box component="span" sx={{ opacity: 0.6 }}>
			{back ? "←" : "→"}
		</Box>
	);
	const value = (
		<Box component="span" sx={{ color: limitLevelColor(threshold.level) }}>
			{Math.round(threshold.pct)}%
		</Box>
	);
	return (
		<Box component="span" sx={slotSx}>
			{back ? (
				<>
					{value}
					{arrow}
				</>
			) : (
				<>
					{arrow}
					{value}
				</>
			)}
		</Box>
	);
}
