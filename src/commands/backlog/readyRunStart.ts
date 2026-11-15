import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { discardStalePause } from "./discardStalePause";
import { ensureStoryBranch } from "./ensureStoryBranch";
import { clearFailedPhases } from "./phaseRun/clearFailedPhases";
import { failOrphanedPhases } from "./phaseRun/failOrphanedPhases";
import { isWake } from "./phaseRun/isWake";
import { setStatus } from "./shared";
import type { BacklogItem } from "./types";

/** Put the item on its branch and in progress before its phases run; false when a daemon wake finds the run was stopped meanwhile. */
export async function readyRunStart(
	id: string,
	item: BacklogItem,
	resumeSessionId: string | undefined,
): Promise<boolean> {
	if (isWake() && item.status !== "in-progress") {
		appendDaemonLog(
			`backlog run ${item.id}: woke with the item ${item.status}; nothing to resume`,
		);
		return false;
	}
	await ensureStoryBranch(item);
	await setStatus(id, "in-progress");
	discardStalePause(item.id);
	if (isWake()) await failOrphanedPhases(item.id);
	else if (!resumeSessionId) await clearFailedPhases(item.id);
	return true;
}
