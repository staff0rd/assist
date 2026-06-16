import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { Fragment } from "react";
import type { RateLimits } from "../../../../shared/RateLimits";
import {
	FIVE_HOUR_SECONDS,
	SEVEN_DAY_SECONDS,
} from "../../../../shared/rateLimitLevel";
import { LimitChip } from "./LimitChip";
import { useNowSeconds } from "./useNowSeconds";

const containerSx = {
	display: "flex",
	alignItems: "center",
	ml: 2,
	fontFamily: "monospace",
	fontSize: 13,
	cursor: "default",
} as const;

export function RateLimitsIndicator({
	rateLimits,
}: {
	rateLimits: RateLimits | null;
}) {
	const now = useNowSeconds(30_000);

	if (!rateLimits) return null;
	const windows = [
		{
			window: rateLimits.five_hour,
			windowSeconds: FIVE_HOUR_SECONDS,
			fallbackLabel: "5h",
		},
		{
			window: rateLimits.seven_day,
			windowSeconds: SEVEN_DAY_SECONDS,
			fallbackLabel: "7d",
		},
	].filter((w) => w.window?.used_percentage != null);
	if (windows.length === 0) return null;

	return (
		<Tooltip title="Claude account usage (5h / 7d windows)">
			<Box sx={containerSx}>
				{windows.map((w, i) => (
					<Fragment key={w.fallbackLabel}>
						{i > 0 ? (
							<Box component="span" sx={{ color: "text.secondary", mr: 0.5 }}>
								,
							</Box>
						) : null}
						<LimitChip
							window={w.window}
							windowSeconds={w.windowSeconds}
							fallbackLabel={w.fallbackLabel}
							now={now}
						/>
					</Fragment>
				))}
			</Box>
		</Tooltip>
	);
}
