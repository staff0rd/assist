import { daemonLog } from "../daemonLog";
import { cleanLeftoversEnabled } from "./cleanLeftoversEnabled";
import { docker } from "./docker";
import { dockerReachable } from "./dockerReachable";
import { containersInside, type InspectedContainer } from "./containersInside";

/** Containers keep their absolute bind sources, so one created from a reaped
 * worktree makes dockerd recreate that path as root when it next starts. */
export async function removeBindMountContainers(
	worktreePath: string,
): Promise<void> {
	if (!cleanLeftoversEnabled()) return;
	if (!(await dockerReachable())) {
		daemonLog(
			`worktree ${worktreePath} container cleanup skipped: Docker is not reachable`,
		);
		return;
	}
	try {
		for (const container of await containersInside(worktreePath))
			await removeContainer(worktreePath, container);
	} catch (error) {
		daemonLog(
			`worktree ${worktreePath} container cleanup failed: ${reason(error)}`,
		);
	}
}

async function removeContainer(
	worktreePath: string,
	container: InspectedContainer,
): Promise<void> {
	const name = container.Name?.replace(/^\//, "") || container.Id;
	try {
		await docker(["rm", "--force", container.Id], 60_000);
		daemonLog(
			`worktree ${worktreePath} container ${name} removed (docker rm --force) so it cannot recreate the worktree's bind-mount sources`,
		);
	} catch (error) {
		daemonLog(
			`worktree ${worktreePath} container ${name} removal failed: ${reason(error)}`,
		);
	}
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
