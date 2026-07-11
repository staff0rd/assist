import type { PhaseUsage, PhaseUsageTotal } from "./types";

export function sumPhaseUsage(usage: PhaseUsage[]): PhaseUsageTotal {
	return usage.reduce<PhaseUsageTotal>(
		(total, u) => ({
			tokensUp: total.tokensUp + u.tokensUp,
			tokensDown: total.tokensDown + u.tokensDown,
			activeMs: total.activeMs + u.activeMs,
		}),
		{ tokensUp: 0, tokensDown: 0, activeMs: 0 },
	);
}
