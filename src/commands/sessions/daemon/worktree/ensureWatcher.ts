import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { createWatcherSession } from "../createWatcherSession";
import { daemonLog } from "../daemonLog";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { liveWatcherFor } from "./liveWatcherFor";
import { resolveClone } from "./resolveClone";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function ensureWatcher(
	ctx: TreeSpawnContext,
	cwd: string | undefined,
): string | undefined {
	if (!cwd) return undefined;
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled || cfg.watcher !== true) return undefined;
	const clone = resolveClone(repoRoot);
	const live = liveWatcherFor(ctx.sessions, clone);
	if (live) {
		daemonLog(
			`no watcher spawned for the clone ${clone}: session ${live.id} is already watching it (${live.status})`,
		);
		return undefined;
	}
	const id = allocateAndBind(
		ctx,
		clone,
		(sid, resolvedCwd) => createWatcherSession(sid, resolvedCwd ?? clone),
		{ inPlace: true },
	);
	daemonLog(
		`spawned watcher session ${id} running /watch in the clone ${clone}`,
	);
	return id;
}
