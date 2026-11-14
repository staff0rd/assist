import {
	type DisplayStatus,
	displayStatus,
} from "../../../../../../../../../../displayStatus";
import type { SessionInfo } from "../../../../../../../../../../types";

const tallyStatuses = ["check", "waiting", "running", "done"] as const;

type TallyEntry = { status: DisplayStatus; count: number };

function tallyStatus(status: DisplayStatus): DisplayStatus {
	return status === "question" || status === "design" ? "waiting" : status;
}

export function groupStatusTally(sessions: SessionInfo[]): TallyEntry[] {
	return tallyStatuses
		.map((status) => ({
			status,
			count: sessions.filter((s) => tallyStatus(displayStatus(s)) === status)
				.length,
		}))
		.filter((entry) => entry.count > 0);
}
