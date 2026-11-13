import { existsSync } from "node:fs";
import { basename } from "node:path";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { accountedTrees } from "./accountedTrees";
import { bindRestoredWorktrees } from "./bindNewWorktree";
import { forgetWorktree, readWorktreeRegistry } from "./readWorktreeRegistry";
import { reclaimVanishedWorktrees } from "./reclaimVanishedWorktrees";
import type { SpawnSession } from "../types";
import { logVanishedTree } from "./logVanishedTree";
import { underTempRoot } from "./underTempRoot";
import { recheckReapedWorktrees } from "./recheckReapedWorktrees";
import { recoverOrphan } from "./recoverOrphan";

export function reconcileWorktreesOnRestore(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	notify: () => void,
): void {
	bindRestoredWorktrees(sessions);
	void recoverOrphanedWorktrees(sessions, spawnWith, notify);
}

async function recoverOrphanedWorktrees(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	notify: () => void,
): Promise<void> {
	const accounted = accountedTrees(sessions);
	const vanished = new Map<string, { path: string; branch: string }[]>();
	for (const { path, clone, harness } of readWorktreeRegistry()) {
		if (underTempRoot(path)) {
			forgetWorktree(path);
			daemonLog(
				`worktree ${path} lies outside any project root; pruned from the registry rather than recovered`,
			);
			continue;
		}
		if (!existsSync(path)) {
			logVanishedTree(sessions, path);
			vanished.set(clone, [
				...(vanished.get(clone) ?? []),
				{ path, branch: basename(path) },
			]);
			continue;
		}
		if (accounted.has(path)) continue;
		await recoverOrphan(sessions, spawnWith, { path, clone, harness }, notify);
	}
	for (const [clone, paths] of vanished)
		await reclaimVanishedWorktrees(clone, paths);
	await recheckReapedWorktrees(accountedTrees(sessions), spawnWith, notify);
}
