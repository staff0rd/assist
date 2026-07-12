import type { Db } from "../../shared/db/Db";
import { findPhaseBySessionId } from "../../shared/db/findPhaseBySessionId";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { appendComment } from "./appendComment";
import type { BacklogItem } from "./types";
import { updateCurrentPhase } from "./updateCurrentPhase";

export async function reconcileResumePhase(
	orm: Db,
	item: BacklogItem,
	startPhase: number,
	resumeSessionId: string | undefined,
): Promise<number> {
	if (!resumeSessionId) return startPhase;

	const resumedPhaseIdx = await findPhaseBySessionId(
		orm,
		item.id,
		resumeSessionId,
	);
	if (resumedPhaseIdx === undefined || resumedPhaseIdx === startPhase) {
		return startPhase;
	}

	const message =
		`resume reconciliation: currentPhase implied phase ${startPhase + 1} ` +
		`but the resumed conversation ${resumeSessionId} ran phase ${resumedPhaseIdx + 1}; ` +
		`resuming phase ${resumedPhaseIdx + 1} to match the conversation`;
	appendDaemonLog(`backlog run ${item.id}: ${message}`);
	try {
		await appendComment(orm, item.id, `Resume reconciled — ${message}`, {
			phase: resumedPhaseIdx + 1,
		});
	} catch {}
	await updateCurrentPhase(orm, item.id, resumedPhaseIdx + 1);

	return resumedPhaseIdx;
}
