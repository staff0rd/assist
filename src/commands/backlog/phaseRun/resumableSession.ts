import type { Db } from "../../../shared/db/Db";
import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import type { BacklogItem } from "../types";
import { resumeSuperseded } from "./resumeSuperseded";

/** The session a restarted run should resume, or undefined when parallel phases already moved past it. */
export async function resumableSession(
	orm: Db,
	item: BacklogItem,
	resumeSessionId: string | undefined,
): Promise<string | undefined> {
	if (!resumeSessionId) return undefined;
	if (!(await resumeSuperseded(orm, item, resumeSessionId)))
		return resumeSessionId;
	appendDaemonLog(
		`backlog run ${item.id}: not resuming ${resumeSessionId}; its phase is done and later phases ran in parallel`,
	);
	return undefined;
}
