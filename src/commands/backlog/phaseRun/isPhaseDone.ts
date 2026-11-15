import type { PhaseProgress } from "./PhaseProgress";

export function isPhaseDone(idx: number, progress: PhaseProgress): boolean {
	return idx < (progress.currentPhase ?? 1) - 1 || progress.done.includes(idx);
}
