import type { RateLimits } from "../../../../../../../../../shared/RateLimits";
import {
	FIVE_HOUR_SECONDS,
	SEVEN_DAY_SECONDS,
} from "../../../../../../../../../shared/rateLimitLevel";

type RateLimitTooltipRowData = {
	label: string;
	pct: number;
	resetsAt: number | undefined;
	windowSeconds: number;
};

export function rateLimitTooltipRows(
	rateLimits: RateLimits,
): RateLimitTooltipRowData[] {
	return [
		{
			label: "5h",
			window: rateLimits.five_hour,
			windowSeconds: FIVE_HOUR_SECONDS,
		},
		{
			label: "7d",
			window: rateLimits.seven_day,
			windowSeconds: SEVEN_DAY_SECONDS,
		},
	].flatMap((row) =>
		row.window?.used_percentage == null
			? []
			: [
					{
						label: row.label,
						pct: row.window.used_percentage,
						resetsAt: row.window.resets_at,
						windowSeconds: row.windowSeconds,
					},
				],
	);
}
