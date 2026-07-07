import type { PhaseUsageRow } from "../../shared/db/schema";
import type { Relations } from "./loadRelations";
import type { BacklogItem, PhaseUsage } from "./types";

function rowToUsage(u: PhaseUsageRow): PhaseUsage {
	return {
		phaseIdx: u.phaseIdx,
		tokensUp: u.tokensUp,
		tokensDown: u.tokensDown,
		activeMs: u.activeMs,
	};
}

export function attachUsage(
	item: BacklogItem,
	rel: Relations,
	id: number,
): void {
	const usage = (rel.usage.get(id) ?? []).map(rowToUsage);
	if (usage.length > 0) item.phaseUsage = usage;
}
