import type { ReleaseNodeState } from "../../../../../releases/types";
import {
	keepLeadAndNonEmpty,
	type ReleasePill,
	releasePill,
} from "../releasePill";

function plural(count: number, word: string): string {
	return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function releaseLivePills(
	environments: ReleaseNodeState[],
	branch: string,
): ReleasePill[] {
	const current = environments.filter((node) => node.behind === 0);
	const waiting = environments.filter((node) => node.queued);
	const drifted = environments.filter(
		(node) => (node.behind ?? 0) > 0 && !node.queued,
	);
	const missing = environments.filter((node) => !node.live);
	const worst = Math.max(0, ...drifted.map((node) => node.behind ?? 0));
	return keepLeadAndNonEmpty([
		releasePill(
			"ok",
			`${current.length} of ${environments.length} running the latest commit on ${branch}`,
			current,
		),
		releasePill(
			"gate",
			`${waiting.length} waiting for someone to approve`,
			waiting,
		),
		releasePill(
			"drift",
			`${drifted.length} behind ${branch}, furthest by ${plural(worst, "commit")}`,
			drifted,
		),
		releasePill(
			"idle",
			`${missing.length} with no successful deployment`,
			missing,
		),
	]);
}
