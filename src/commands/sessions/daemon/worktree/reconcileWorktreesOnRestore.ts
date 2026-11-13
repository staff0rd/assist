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
import type { Leftover } from "./Leftover";
import { recoverOrphan } from "./recoverOrphan";
import { reportReconciledLeftovers } from "./reportReconciledLeftovers";

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
	const leftovers: Leftover[] = [];
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
		const leftover = await recoverOrphan(
			sessions,
			spawnWith,
			{ path, clone, harness },
			notify,
		);
		if (leftover) leftovers.push(leftover);
	}
	for (const [clone, paths] of vanished)
		await reclaimVanishedWorktrees(clone, paths);
	await reportReconciledLeftovers(sessions, spawnWith, leftovers, notify);
}
