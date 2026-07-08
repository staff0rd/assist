import {
	type SpawnClaudeOptions,
	withoutResumeSession,
} from "../../shared/spawnClaude";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { consumePause } from "./consumePause";
import { executePhase } from "./executePhase";
import { reloadPlan } from "./reloadPlan";
import type { BacklogItem, PlanPhase } from "./types";

type PhasesResult =
	| { kind: "completed" }
	| { kind: "fail" }
	| { kind: "paused" };

export async function runPhases(
	item: BacklogItem,
	startPhase: number,
	plan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<PhasesResult> {
	let phaseIndex = startPhase;
	let currentPlan = plan;
	/* why: only the first phase after a restart resumes its interrupted Claude
	 * session; every phase after it starts a fresh conversation. */
	let phaseOptions = spawnOptions;
	while (phaseIndex < currentPlan.length) {
		phaseIndex = await executePhase(
			item,
			phaseIndex,
			currentPlan,
			phaseOptions,
			// +1 for the review phase appended after the authored phases complete
			currentPlan.length + 1,
		);
		phaseOptions = withoutResumeSession(phaseOptions);
		if (phaseIndex < 0) return { kind: "fail" };
		// why: auto-advance off stops here; consumePause clears the one-shot request.
		if (consumePause(item.id)) {
			appendDaemonLog(
				`backlog run ${item.id}: paused before phase ${phaseIndex + 1} — consumed pending pause request (Continue turned off)`,
			);
			return { kind: "paused" };
		}
		// Re-resolve from the DB so phases added mid-run (e.g. appended to the end
		// while the last phase is executing) extend the loop instead of being
		// skipped in favour of the review phase.
		currentPlan = (await reloadPlan(item.id)) ?? currentPlan;
	}
	return { kind: "completed" };
}
