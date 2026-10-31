import { getDb } from "../../../../shared/db/getDb";
import { writeInboxLastRun } from "../../../../shared/db/writeInboxLastRun";
import type { InboxScanRun } from "../../../inbox/InboxScanEvent";
import { daemonLog } from "../daemonLog";

export async function saveScanRun(run: InboxScanRun): Promise<void> {
	try {
		await writeInboxLastRun(await getDb(), run);
		daemonLog(
			`inbox: saved last scan run (${run.status}, ${run.events.length} event(s))`,
		);
	} catch (error) {
		daemonLog(`inbox: saving the last scan run failed: ${String(error)}`);
	}
}
