import Box from "@mui/material/Box";
import { harnessLabel } from "../../../../../../../../shared/harnessAdapters/harnessLabel";
import { harnessRateLimitsTooltipSx } from "./HarnessRateLimitsTooltip/harnessRateLimitsTooltipSx";
import type { HarnessLimitGroup } from "./harnessLimitGroups";
import { RateLimitTooltipList } from "./RateLimitTooltipList";
import { useNowSeconds } from "../../../useNowSeconds";

export function HarnessRateLimitsTooltip({
	groups,
}: {
	groups: HarnessLimitGroup[];
}) {
	const now = useNowSeconds(30_000);
	const sx = harnessRateLimitsTooltipSx;
	return (
		<Box sx={sx.root}>
			{groups.map((group) => (
				<Box key={group.harness} sx={sx.group}>
					<Box sx={sx.heading}>{harnessLabel(group.harness)}</Box>
					<RateLimitTooltipList rateLimits={group.rateLimits} now={now} />
				</Box>
			))}
			<Box sx={sx.foot}>Account usage per harness — view history</Box>
		</Box>
	);
}
