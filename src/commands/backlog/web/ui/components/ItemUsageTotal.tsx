import type { PhaseUsage } from "../types";
import { UsageSummary } from "./UsageSummary";

const totalSx = { color: "text.secondary", fontSize: "0.75rem" } as const;

/** Item-level cost: the sum of every phase's tokens up/down and active time. */
export function ItemUsageTotal({ usage }: { usage: PhaseUsage[] }) {
	const total = {
		tokensUp: usage.reduce((sum, u) => sum + u.tokensUp, 0),
		tokensDown: usage.reduce((sum, u) => sum + u.tokensDown, 0),
		activeMs: usage.reduce((sum, u) => sum + u.activeMs, 0),
		peakContextPct: usage.reduce(
			(max, u) => Math.max(max, u.peakContextPct),
			0,
		),
	};
	return <UsageSummary total={total} sx={totalSx} />;
}
