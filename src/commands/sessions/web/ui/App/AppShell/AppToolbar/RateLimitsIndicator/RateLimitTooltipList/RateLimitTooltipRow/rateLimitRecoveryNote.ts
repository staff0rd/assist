import type { RateLimitRecovery } from "../../../../../../../../../../shared/nextRateLimitStep";
import { formatRateLimitTimeLeft } from "../../../../../../../../../../shared/rateLimitLevel";

export function rateLimitRecoveryNote(
	recovery: RateLimitRecovery,
	now: number,
): string {
	if (recovery.at == null) return "not before reset";
	const target = recovery.level === "ok" ? "green" : "under";
	return `${target} in ${formatRateLimitTimeLeft(recovery.at, now)}`;
}
