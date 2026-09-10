export type ItemUsageSummaryRow = {
	id: number;
	origin: string;
	type: string;
	name: string;
	status: string;
	phaseCount: number;
	recordedPhases: number;
	tokensUp: number;
	tokensDown: number;
	activeMs: number;
	peakContextPct: number;
	lastPhaseAt: string | null;
};

type QueriedRow = Omit<
	ItemUsageSummaryRow,
	"phaseCount" | "lastPhaseAt" | "recordedPhases"
> & {
	phaseCount: number | null;
	recordedPhases: number | null;
	lastPhaseAt: string | null;
};

export function toItemUsageSummary(row: QueriedRow): ItemUsageSummaryRow {
	return {
		...row,
		phaseCount: row.phaseCount ?? 0,
		recordedPhases: Number(row.recordedPhases),
		tokensUp: Number(row.tokensUp),
		tokensDown: Number(row.tokensDown),
		activeMs: Number(row.activeMs),
		peakContextPct: Number(row.peakContextPct),
		lastPhaseAt: row.lastPhaseAt ?? null,
	};
}
