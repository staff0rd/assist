import Box from "@mui/material/Box";
import { Fragment } from "react";
import type { RateLimits } from "../../../../shared/RateLimits";
import {
	FIVE_HOUR_SECONDS,
	SEVEN_DAY_SECONDS,
} from "../../../../shared/rateLimitLevel";
import { LimitChip } from "./LimitChip";
import { useNowSeconds } from "./useNowSeconds";

/** Comma-separated 5h/7d usage chips; renders the windows that carry a percentage. */
export function RateLimitChips({ rateLimits }: { rateLimits: RateLimits }) {
	const now = useNowSeconds(30_000);
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

	return (
		<>
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
		</>
	);
}
