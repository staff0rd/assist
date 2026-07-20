import { expandTilde } from "../../shared/expandTilde";
import { loadConfig } from "../../shared/loadConfig";
import { getCurrentOrigin } from "./getCurrentOrigin";
import { loadItemSummaries } from "./loadItemSummaries";
import { originDisplayLabels } from "./originDisplayLabels";
import { resolveRepoLocation } from "./resolveRepoLocation";
import { getReady } from "./shared";

const completedStatuses = new Set(["done", "wontdo"]);

type RepoSummary = {
	origin: string;
	displayName: string;
	openCount: number;
	isCurrent: boolean;
	cwd?: string;
	cloneTarget?: string;
};

export async function loadRepoSummaries(
	currentOrigin: string,
	knownCwds: string[] = [],
): Promise<RepoSummary[]> {
	const { orm } = await getReady();
	const summaries = await loadItemSummaries(orm, undefined);

	const openCounts = new Map<string, number>();
	for (const item of summaries) {
		if (!item.origin || completedStatuses.has(item.status)) continue;
		openCounts.set(item.origin, (openCounts.get(item.origin) ?? 0) + 1);
	}

	const cwdByOrigin = new Map<string, string>();
	for (const cwd of knownCwds) {
		const origin = getCurrentOrigin(cwd);
		if (!cwdByOrigin.has(origin)) cwdByOrigin.set(origin, cwd);
	}

	const labels = originDisplayLabels([...openCounts.keys()]);
	const baseDir = expandTilde(loadConfig().clone.baseDir);

	return [...openCounts.entries()]
		.map(([origin, openCount]) => {
			const { cwd, cloneTarget } = resolveRepoLocation(
				origin,
				cwdByOrigin.get(origin),
				baseDir,
			);
			return {
				origin,
				displayName: labels.get(origin) ?? origin,
				openCount,
				isCurrent: origin === currentOrigin,
				cwd,
				cloneTarget,
			};
		})
		.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
