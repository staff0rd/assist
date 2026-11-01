import { getDb } from "../../../../shared/db/getDb";
import { formatScanUsage } from "../../../inbox/formatScanUsage";
import type { InboxScanListener } from "../../../inbox/InboxScanEvent";
import { runInboxScan } from "../../../inbox/runInboxScan";
import { daemonLog } from "../daemonLog";

export type ScanOutcome =
	| { ok: true; flagged: number; added: number }
	| { ok: false; error: string };

export type ScanReason = "scheduled" | "requested";

export async function runLoggedInboxScan(
	reason: ScanReason,
	listener: InboxScanListener,
): Promise<ScanOutcome> {
	daemonLog(`inbox: scan started (${reason})`);
	try {
		const { flagged, added, usage } = await runInboxScan(await getDb(), {
			...listener,
			trigger: reason === "scheduled" ? "scheduled" : "manual",
		});
		daemonLog(
			`inbox: scan flagged ${flagged} message(s), ${added} new (${formatScanUsage(usage)})`,
		);
		return { ok: true, flagged, added };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(`inbox: scan failed: ${message}`);
		return { ok: false, error: message };
	}
}
