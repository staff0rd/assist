import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import { formatTokens } from "../../../../shared/formatTokens";

export function usagePeakTokens(peak: UsagePeakRow): string {
	if (!peak.tokensUp && !peak.tokensDown) return "—";
	return `↑ ${formatTokens(peak.tokensUp)} ↓ ${formatTokens(peak.tokensDown)}`;
}
