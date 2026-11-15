import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { getReady } from "../shared";
import { loadPhaseProgress } from "./loadPhaseProgress";
import { setPhaseRunState } from "./setPhaseRunState";

/** The daemon only wakes a parked run once none of its phase sessions are alive, so a phase still marked running ended without settling. */
export async function failOrphanedPhases(itemId: number): Promise<void> {
	const { orm } = await getReady();
	const { running } = await loadPhaseProgress(orm, itemId);
	if (running.length === 0) return;
	appendDaemonLog(
		`backlog run ${itemId}: woke with phase ${running.map((idx) => idx + 1).join(", ")} still marked running but no session left; marking failed`,
	);
	await setPhaseRunState(orm, itemId, running, "failed");
}
