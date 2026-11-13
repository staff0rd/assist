import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { daemonLog } from "../daemonLog";
import { docker } from "./docker";
import { dockerReachable } from "./dockerReachable";
import type { TreeRemoval } from "./TreeRemoval";

const IMAGE = "alpine:3";

/** Deletes a tree holding files another user (root, via a Docker bind mount)
 * owns, without sudo, by running rm as root inside a throwaway container. */
export async function deleteViaDocker(
	worktreePath: string,
	cause: string,
): Promise<TreeRemoval> {
	if (!(await dockerReachable())) {
		const reason = `it holds files owned by another user (e.g. root, from a Docker bind mount) and Docker is not reachable to delete them; retried on each daemon restart (${cause})`;
		daemonLog(`worktree ${worktreePath} delete deferred: ${reason}`);
		return { removed: false, reason, deferred: true };
	}
	const parent = dirname(worktreePath);
	const target = `/p/${basename(worktreePath)}`;
	const how = `docker run --rm -v ${parent}:/p ${IMAGE} rm -rf ${target}`;
	try {
		await docker(
			["run", "--rm", "-v", `${parent}:/p`, IMAGE, "rm", "-rf", target],
			180_000,
		);
	} catch (error) {
		const reason = `${how} failed: ${error instanceof Error ? error.message : String(error)}`;
		daemonLog(`worktree ${worktreePath} Docker delete failed: ${reason}`);
		return { removed: false, reason };
	}
	if (existsSync(worktreePath)) {
		const reason = `${how} exited cleanly but the path is still there`;
		daemonLog(`worktree ${worktreePath} Docker delete failed: ${reason}`);
		return { removed: false, reason };
	}
	daemonLog(`worktree ${worktreePath} deleted through Docker (${how})`);
	return { removed: true };
}
