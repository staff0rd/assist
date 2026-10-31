import type { InboxScanEvent } from "../../../inbox/InboxScanEvent";
import type { ScanOutcome } from "./runLoggedInboxScan";

export function outcomeEvent(outcome: ScanOutcome): InboxScanEvent {
	const at = new Date().toISOString();
	return outcome.ok
		? {
				at,
				kind: "result",
				label: "Result",
				detail: `Flagged ${outcome.flagged} message(s), ${outcome.added} new`,
			}
		: { at, kind: "error", label: "Failed", detail: outcome.error };
}
