import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStore } from "./createAutopilotStore";

const MAX_DEPTH = 8;

export function autopilotRunOwner(
	store: AutopilotStore,
	deps: AutopilotDeps,
	sessionId: string,
): string | undefined {
	const live = new Map(
		store
			.cwds()
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
