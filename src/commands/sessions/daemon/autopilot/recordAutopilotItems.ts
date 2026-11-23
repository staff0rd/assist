import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStore } from "./createAutopilotStore";

const MAX_ITEMS = 50;

export function recordAutopilotItems(
	store: AutopilotStore,
	deps: AutopilotDeps,
	cwd: string,
): void {
	const repo = store.repo(cwd);
	if (!repo.current) return;
	const known = new Set(repo.items?.map((item) => item.id));
	const added = [
		...new Set(
			deps
				.runItems(repo.current.sessionId)
				.map((run) => run.itemId)
				.filter((id) => !known.has(id)),
		),
	];
	if (added.length === 0) return;
	daemonLog(
		`autopilot: ${cwd} run ${repo.current.sessionId} started item(s) ${added.join(", ")}`,
	);
	const startedAt = new Date().toISOString();
	store.update(cwd, (next) => {
		next.items = [
			...(next.items ?? []),
			...added.map((id) => ({ id, startedAt })),
		].slice(-MAX_ITEMS);
	});
}
