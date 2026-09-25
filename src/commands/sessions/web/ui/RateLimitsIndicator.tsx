import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { Link as RouterLink } from "react-router";
import type {
	HarnessRateLimits,
	RateLimits,
} from "../../../../shared/RateLimits";
import { HarnessRateLimitChips } from "./HarnessRateLimitChips";
import { HarnessRateLimitsTooltip } from "./HarnessRateLimitsTooltip";
import { harnessLimitGroups } from "./harnessLimitGroups";
import { RateLimitChips } from "./RateLimitChips";
import {
	RATE_LIMITS_TOOLTIP_HINT,
	RateLimitsTooltip,
} from "./RateLimitsTooltip";

const containerSx = {
	display: "flex",
	alignItems: "center",
	ml: 2,
	fontFamily: "monospace",
	fontSize: 13,
} as const;

const NO_HARNESS_LIMITS: HarnessRateLimits = {};

export function RateLimitsIndicator({
	rateLimits,
	harnessRateLimits = NO_HARNESS_LIMITS,
}: {
	rateLimits: RateLimits | null;
	harnessRateLimits?: HarnessRateLimits;
}) {
	const groups = harnessLimitGroups(rateLimits, harnessRateLimits);
	const claudeOnly = groups.every((g) => g.harness === "claude");
	const claude = rateLimits as RateLimits;
	let title: React.ReactNode = RATE_LIMITS_TOOLTIP_HINT;
	let content: React.ReactNode = "Usage";
	if (groups.length > 0 && claudeOnly) {
		title = <RateLimitsTooltip rateLimits={claude} />;
		content = <RateLimitChips rateLimits={claude} />;
	} else if (groups.length > 0) {
		title = <HarnessRateLimitsTooltip groups={groups} />;
		content = <HarnessRateLimitChips groups={groups} />;
	}
	return (
		<Tooltip title={title}>
			<Link
				component={RouterLink}
				to="/usage"
				underline="hover"
				color="inherit"
				sx={containerSx}
			>
				{content}
			</Link>
		</Tooltip>
	);
}
