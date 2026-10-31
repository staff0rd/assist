import { getDb } from "../../../../shared/db/getDb";
import type { InboxScanEvent } from "../../../inbox/InboxScanEvent";
import { runInboxScan } from "../../../inbox/runInboxScan";
import { daemonLog } from "../daemonLog";

export type ScanOutcome =
	| { ok: true; flagged: number; added: number }
	| { ok: false; error: string };

export async function runLoggedInboxScan(
	reason: string,
	onEvent: (event: InboxScanEvent) => void,
): Promise<ScanOutcome> {
	daemonLog(`inbox: scan started (${reason})`);
	try {
		const { flagged, added } = await runInboxScan(await getDb(), { onEvent });
		daemonLog(`inbox: scan flagged ${flagged} message(s), ${added} new`);
		return { ok: true, flagged, added };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(`inbox: scan failed: ${message}`);
		return { ok: false, error: message };
	}
}
