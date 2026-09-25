import type { HarnessKind } from "../../../../shared/harnesses";
import type {
	HarnessRateLimits,
	RateLimits,
} from "../../../../shared/RateLimits";

export type HarnessLimitGroup = {
	harness: HarnessKind;
	rateLimits: RateLimits;
};

function hasRateLimitUsage(
	rateLimits: RateLimits | null | undefined,
): rateLimits is RateLimits {
	return (
		rateLimits?.five_hour?.used_percentage != null ||
		rateLimits?.seven_day?.used_percentage != null
	);
}

export function harnessLimitGroups(
	claude: RateLimits | null,
	others: HarnessRateLimits,
): HarnessLimitGroup[] {
	const groups: HarnessLimitGroup[] = [];
	if (hasRateLimitUsage(claude))
		groups.push({ harness: "claude", rateLimits: claude });
	for (const [harness, rateLimits] of Object.entries(others)) {
		if (hasRateLimitUsage(rateLimits))
			groups.push({ harness: harness as HarnessKind, rateLimits });
	}
	return groups;
}
