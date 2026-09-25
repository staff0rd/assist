import type { HarnessKind } from "./harnesses";

export type HarnessRateLimits = Partial<
	Record<Exclude<HarnessKind, "claude">, RateLimits>
>;

export type RateLimits = {
	five_hour?: { used_percentage?: number; resets_at?: number };
	seven_day?: { used_percentage?: number; resets_at?: number };
};
