import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { Link as RouterLink } from "react-router";
import type { RateLimits } from "../../../../shared/RateLimits";
import { RateLimitChips } from "./RateLimitChips";

const containerSx = {
	display: "flex",
	alignItems: "center",
	ml: 2,
	fontFamily: "monospace",
	fontSize: 13,
} as const;

function hasUsage(rateLimits: RateLimits | null): rateLimits is RateLimits {
	return (
		rateLimits?.five_hour?.used_percentage != null ||
		rateLimits?.seven_day?.used_percentage != null
	);
}

export function RateLimitsIndicator({
	rateLimits,
}: {
	rateLimits: RateLimits | null;
}) {
	return (
		<Tooltip title="Claude account usage (5h / 7d windows) — view history">
			<Link
				component={RouterLink}
				to="/usage"
				underline="hover"
				color="inherit"
				sx={containerSx}
			>
				{hasUsage(rateLimits) ? (
					<RateLimitChips rateLimits={rateLimits} />
				) : (
					"Usage"
				)}
			</Link>
		</Tooltip>
	);
}
