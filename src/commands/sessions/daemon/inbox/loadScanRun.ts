import { getDb } from "../../../../shared/db/getDb";
import { readInboxLastRun } from "../../../../shared/db/readInboxLastRun";
import type { InboxScanRun } from "../../../inbox/InboxScanEvent";
import { daemonLog } from "../daemonLog";

export async function loadScanRun(): Promise<InboxScanRun | undefined> {
	try {
		const saved = await readInboxLastRun(await getDb());
		if (saved) daemonLog(`inbox: restored last scan run (${saved.status})`);
		return saved;
	} catch (error) {
		daemonLog(`inbox: reading the last scan run failed: ${String(error)}`);
		return undefined;
	}
}
