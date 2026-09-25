import type { RateLimits } from "../../../../shared/RateLimits";
import type { RateLimitWindow } from "../../../../shared/usageWindowKey";

type CodexLimitWindow = {
	used_percent?: number;
	window_minutes?: number;
	resets_at?: number;
};

const WINDOW_BY_MINUTES: Record<number, RateLimitWindow> = {
	300: "five_hour",
	10080: "seven_day",
};

export function toRateLimits(raw: unknown): RateLimits | undefined {
	if (!raw || typeof raw !== "object") return undefined;
	const { primary, secondary } = raw as Record<string, unknown>;
	const rateLimits: RateLimits = {};
	for (const candidate of [primary, secondary]) {
		if (!candidate || typeof candidate !== "object") continue;
		const limit = candidate as CodexLimitWindow;
		const window = WINDOW_BY_MINUTES[limit.window_minutes ?? 0];
		if (!window || typeof limit.used_percent !== "number") continue;
		rateLimits[window] = {
			used_percentage: limit.used_percent,
			resets_at: limit.resets_at,
		};
	}
	return Object.keys(rateLimits).length > 0 ? rateLimits : undefined;
}
