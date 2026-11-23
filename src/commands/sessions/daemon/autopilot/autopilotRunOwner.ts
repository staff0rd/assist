import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStore } from "./createAutopilotStore";

const MAX_DEPTH = 8;

export function autopilotRunOwner(
	store: AutopilotStore,
	deps: AutopilotDeps,
	sessionId: string,
	scheduled: string[],
): string | undefined {
	/* why: session ids restart with the daemon, so a stale record (e.g. an old
	 * worktree's) can hold a reused id; only scheduled repos can own a run. */
	const live = new Map(
		scheduled
			.map((cwd) => [store.repo(cwd).current?.sessionId, cwd] as const)
			.filter(([id]) => id !== undefined),
	);
	let id: string | undefined = sessionId;
	for (let depth = 0; id && depth < MAX_DEPTH; depth++) {
		const cwd = live.get(id);
		if (cwd) return cwd;
		id = deps.sessionLink(id)?.launchedFrom;
	}
	return undefined;
}
