import type { HarnessKind } from "./harnesses";
import type { RateLimits } from "./RateLimits";
import {
	RATE_LIMIT_WINDOWS,
	type UsageWindowKey,
	usageWindowKey,
} from "./usageWindowKey";

export type ActiveWindow = {
	window: UsageWindowKey;
	resetsAt: number;
};

export function activeWindows(
	rateLimits: RateLimits | undefined,
	harness?: HarnessKind,
): ActiveWindow[] {
	if (!rateLimits) return [];
	const out: ActiveWindow[] = [];
	for (const window of RATE_LIMIT_WINDOWS) {
		const resetsAt = rateLimits[window]?.resets_at;
		if (typeof resetsAt === "number")
			out.push({ window: usageWindowKey(harness, window), resetsAt });
	}
	return out;
}
