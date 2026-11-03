import { statSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { daemonLog } from "../daemonLog";
import { git } from "./git";
import type { TreeRemoval } from "./TreeRemoval";

export async function deleteTreeDirectly(
	clone: string,
	worktreePath: string,
	why: string,
): Promise<TreeRemoval> {
	if (holdsAGitDirectoryRatherThanALink(worktreePath)) {
		const refusal = "it is a clone of its own, not a linked worktree";
		daemonLog(
			`worktree ${worktreePath} not deleted directly (${why}): ${refusal}`,
		);
		return { removed: false, reason: refusal };
	}
	daemonLog(`worktree ${worktreePath} deleting its directory directly: ${why}`);
	try {
		await rm(worktreePath, {
			recursive: true,
			force: true,
			maxRetries: 3,
			retryDelay: 200,
		});
	} catch (error) {
		const failure = deleteFailure(worktreePath, error);
		daemonLog(
			`worktree ${worktreePath} directory delete failed, left in place for the next reconcile: ${failure}`,
		);
		return { removed: false, reason: failure };
	}
	daemonLog(`worktree ${worktreePath} directory deleted directly`);
	await pruneBookkeeping(clone, worktreePath);
	return { removed: true };
}

function holdsAGitDirectoryRatherThanALink(worktreePath: string): boolean {
	return (
		statSync(join(worktreePath, ".git"), {
			throwIfNoEntry: false,
		})?.isDirectory() === true
	);
}

async function pruneBookkeeping(
	clone: string,
	worktreePath: string,
): Promise<void> {
	try {
		await git(clone, ["worktree", "prune"]);
		daemonLog(
			`worktree bookkeeping pruned in clone ${clone} after deleting ${worktreePath} directly`,
		);
	} catch (error) {
		daemonLog(
			`worktree bookkeeping prune failed in clone ${clone} after deleting ${worktreePath}: ${reason(error)}`,
		);
	}
}

function deleteFailure(worktreePath: string, error: unknown): string {
	const code = (error as NodeJS.ErrnoException | undefined)?.code;
	if (code !== "EACCES" && code !== "EPERM") return reason(error);
	return `${worktreePath} holds files owned by another user (e.g. root, from a Docker bind mount) that assist cannot delete; remove it with \`sudo rm -rf ${worktreePath}\` (${reason(error)})`;
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
