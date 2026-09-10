import type { ItemUsageStats } from "../../../../shared/db/itemUsageStats";
import { formatTokens } from "../../../../shared/formatTokens";
import { formatActiveTime } from "../../../backlog/web/ui/components/formatActiveTime";

type UsageItemStatFigures = {
	items: string;
	itemsFoot: string;
	phases: string;
	active: string;
	activeFoot: string;
	tokens: string;
	tokensFoot: string;
};

export function usageItemStatFigures(
	summary: ItemUsageStats,
): UsageItemStatFigures {
	const phases = Math.max(1, summary.medianPhases);
	const repos = summary.repoCount === 1 ? "repo" : "repos";
	return {
		items: String(summary.itemCount),
		itemsFoot: `across ${summary.repoCount} ${repos} · ${summary.doneCount} done`,
		phases: String(Math.round(summary.medianPhases * 10) / 10),
		active: formatActiveTime(summary.medianActiveMs),
		activeFoot: `${formatActiveTime(summary.medianActiveMs / phases)} per phase`,
		tokens: formatTokens(Math.round(summary.medianTokens)),
		tokensFoot: `${formatTokens(Math.round(summary.medianTokens / phases))} per phase`,
	};
}
