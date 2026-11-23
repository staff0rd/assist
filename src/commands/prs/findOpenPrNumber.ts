import type { BaseRepoMode } from "./resolveBaseRepo";
import { findCurrentPr } from "./findCurrentPr";

export function findOpenPrNumber(baseRepo?: BaseRepoMode): number | null {
	const pr = findCurrentPr(baseRepo);
	if (pr === null || pr.state === "OPEN") return pr?.number ?? null;
	console.error(
		`Error: This branch's pull request #${pr.number} is already ${pr.state.toLowerCase()}. Move the work to a new branch (e.g. 'assist branch') and raise the PR from there.`,
	);
	process.exit(1);
}
