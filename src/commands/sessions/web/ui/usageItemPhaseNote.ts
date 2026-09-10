import type { UsageItemRow } from "./fetchUsageItems";

export function usageItemPhaseNote(row: UsageItemRow): string | undefined {
	if (row.status === "done" || row.recordedPhases > row.phaseCount)
		return undefined;
	return `${row.recordedPhases} of ${row.phaseCount} phases`;
}
