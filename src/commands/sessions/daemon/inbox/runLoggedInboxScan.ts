import { getDb } from "../../../../shared/db/getDb";
import { runInboxScan } from "../../../inbox/runInboxScan";
import { daemonLog } from "../daemonLog";

export async function runLoggedInboxScan(
	reason: string,
): Promise<string | undefined> {
	daemonLog(`inbox: scan started (${reason})`);
	try {
		const { flagged, added } = await runInboxScan(await getDb());
		daemonLog(`inbox: scan flagged ${flagged} message(s), ${added} new`);
		return undefined;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(`inbox: scan failed: ${message}`);
		return message;
	}
}
