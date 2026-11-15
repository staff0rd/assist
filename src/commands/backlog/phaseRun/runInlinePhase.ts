import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { consumePause } from "../consumePause";
import { executePhase } from "../executePhase";
import { getReady } from "../shared";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "../types";
import { loadPhaseProgress } from "./loadPhaseProgress";
import { markPhaseDone } from "./markPhaseDone";
import type { PhasesResult } from "./PhasesResult";

type InlineResult = { stop?: PhasesResult; preferred?: number };

/** Run one phase in this session, on the item branch, exactly as a sequential run does. */
export async function runInlinePhase(
	item: BacklogItem,
	idx: number,
	plan: PlanPhase[],
	spawnOptions?: BacklogRunOptions,
): Promise<InlineResult> {
	// +1 for the review phase appended after the authored phases complete
	const outcome = await executePhase(
		item,
		idx,
		plan,
		spawnOptions,
		plan.length + 1,
	);
	if (outcome.kind === "abort") return { stop: { kind: "fail" } };
	const { orm } = await getReady();
	if (outcome.kind === "skip")
		await markPhaseDone(orm, item.id, idx, plan.length);
	const preferred =
		outcome.kind === "rewind"
			? outcome.targetPhase
			: outcome.kind === "retry"
				? idx
				: undefined;
	// why: auto-advance off stops here; consumePause clears the one-shot request.
	if (consumePause(item.id)) {
		const next = (await loadPhaseProgress(orm, item.id)).currentPhase ?? 1;
		appendDaemonLog(
			`backlog run ${item.id}: paused before phase ${next} — consumed pending pause request (Continue turned off)`,
		);
		return { stop: { kind: "paused" } };
	}
	return { preferred };
}
