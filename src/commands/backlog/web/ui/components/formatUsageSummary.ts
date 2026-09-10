import { formatTokens } from "../../../../../shared/formatTokens";
import type { PhaseUsageTotal } from "../types";
import { formatActiveTime } from "./formatActiveTime";

export function formatUsageSummary(total: PhaseUsageTotal): string {
	const peak =
		total.peakContextPct > 0 ? ` · ▓ ${Math.round(total.peakContextPct)}%` : "";
	return `↑ ${formatTokens(total.tokensUp)} ↓ ${formatTokens(
		total.tokensDown,
	)} · ⏱ ${formatActiveTime(total.activeMs)}${peak}`;
}
