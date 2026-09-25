import Box from "@mui/material/Box";
import { harnessLabel } from "../../../../shared/harnessLabel";
import type { HarnessLimitGroup } from "./harnessLimitGroups";
import { RateLimitTooltipList } from "./RateLimitTooltipList";
import { useNowSeconds } from "./useNowSeconds";

export function HarnessRateLimitsTooltip({
	groups,
}: {
	groups: HarnessLimitGroup[];
}) {
	const now = useNowSeconds(30_000);
	return (
		<Box sx={{ fontFamily: "monospace", fontSize: 12 }}>
			{groups.map((group) => (
				<Box key={group.harness} sx={{ mb: 0.5 }}>
					<Box sx={{ opacity: 0.8 }}>{harnessLabel(group.harness)}</Box>
					<RateLimitTooltipList rateLimits={group.rateLimits} now={now} />
				</Box>
			))}
			<Box sx={{ mt: 0.5, opacity: 0.6 }}>
				Account usage per harness — view history
			</Box>
		</Box>
	);
}
