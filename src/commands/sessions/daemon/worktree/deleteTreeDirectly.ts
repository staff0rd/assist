import { statSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { daemonLog } from "../daemonLog";
import { deleteViaDocker } from "./deleteViaDocker";
import type { TreeRemoval } from "./TreeRemoval";
import { pruneBookkeeping } from "./pruneBookkeeping";

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
		if (!ownedByAnotherUser(error)) {
			daemonLog(
				`worktree ${worktreePath} directory delete failed, left in place for the next reconcile: ${reason(error)}`,
			);
			return { removed: false, reason: reason(error) };
		}
		daemonLog(
			`worktree ${worktreePath} directory delete hit files owned by another user, falling back to Docker: ${reason(error)}`,
		);
		const viaDocker = await deleteViaDocker(worktreePath, reason(error));
		if (!viaDocker.removed) return viaDocker;
		await pruneBookkeeping(clone, worktreePath);
		return viaDocker;
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

function ownedByAnotherUser(error: unknown): boolean {
	const code = (error as NodeJS.ErrnoException | undefined)?.code;
	return code === "EACCES" || code === "EPERM";
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
