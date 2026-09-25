import type { RateLimits } from "../../../../../../../../shared/RateLimits";
import { RateLimitTooltipRow } from "./RateLimitTooltipList/RateLimitTooltipRow";
import { rateLimitTooltipRows } from "./RateLimitTooltipList/rateLimitTooltipRows";

export function RateLimitTooltipList({
	rateLimits,
	now,
}: {
	rateLimits: RateLimits;
	now: number;
}) {
	return rateLimitTooltipRows(rateLimits).map((row) => (
		<RateLimitTooltipRow
			key={row.label}
			label={row.label}
			pct={row.pct}
			resetsAt={row.resetsAt}
			windowSeconds={row.windowSeconds}
			now={now}
		/>
	));
}
