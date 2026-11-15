import type { PhaseRow } from "../../shared/db/schema";
import type { BacklogItem } from "./types";

export function attachPhaseRuns(item: BacklogItem, phases: PhaseRow[]): void {
	const withState = (state: string) =>
		phases.filter((p) => p.runState === state).map((p) => p.idx + 1);
	const running = withState("running");
	const done = withState("done");
	if (running.length > 0) item.runningPhases = running;
	if (done.length > 0) item.donePhases = done;
}
