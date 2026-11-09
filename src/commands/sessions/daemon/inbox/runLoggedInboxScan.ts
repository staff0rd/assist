import { getDb } from "../../../../shared/db/getDb";
import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../../shared/harnesses";
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
	harness?: HarnessKind,
): Promise<ScanOutcome> {
	const adapter = harnessAdapter(harness);
	daemonLog(`inbox: scan started (${reason}, ${adapter.label})`);
	try {
		const { flagged, added, usage } = await runInboxScan(await getDb(), {
			...listener,
			adapter,
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
