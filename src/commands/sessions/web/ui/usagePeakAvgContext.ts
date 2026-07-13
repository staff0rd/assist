import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";

export function usagePeakAvgContext(peak: UsagePeakRow): string {
	if (peak.avgContextPct == null) return "—";
	return `${Math.round(peak.avgContextPct)}%`;
}
