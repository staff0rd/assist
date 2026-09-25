import Box from "@mui/material/Box";
import type { RateLimits } from "../../../../../../../../shared/RateLimits";
import { RateLimitTooltipList } from "./RateLimitTooltipList";
import { useNowSeconds } from "../../useNowSeconds";

export const RATE_LIMITS_TOOLTIP_HINT =
	"Claude account usage (5h / 7d windows) — view history";

export function RateLimitsTooltip({ rateLimits }: { rateLimits: RateLimits }) {
	const now = useNowSeconds(30_000);
	return (
		<Box sx={{ fontFamily: "monospace", fontSize: 12 }}>
			<RateLimitTooltipList rateLimits={rateLimits} now={now} />
			<Box sx={{ mt: 0.5, opacity: 0.6 }}>{RATE_LIMITS_TOOLTIP_HINT}</Box>
		</Box>
	);
}
