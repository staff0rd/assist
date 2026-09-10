import type { BacklogItemSummary } from "../types";

export type PhaseSegmentKind = "done" | "current" | "remaining" | "complete";

type PhaseSegments = {
	reached: number;
	total: number;
	segments: { phase: number; kind: PhaseSegmentKind }[];
};

function reachedPhase(item: BacklogItemSummary) {
	if (item.status === "done") return item.totalPhases;
	if (item.status === "in-progress") return item.currentPhase;
	return undefined;
}

function segmentKind(
	phase: number,
	reached: number,
	complete: boolean,
): PhaseSegmentKind {
	if (complete) return "complete";
	if (phase < reached) return "done";
	return phase === reached ? "current" : "remaining";
}

export function phaseMeterSegments(
	item: BacklogItemSummary,
): PhaseSegments | undefined {
	const total = item.totalPhases;
	const reached = reachedPhase(item);
	if (!total || reached == null) return undefined;
	const complete = item.status === "done";
	return {
		reached,
		total,
		segments: Array.from({ length: total }, (_, index) => ({
			phase: index + 1,
			kind: segmentKind(index + 1, reached, complete),
		})),
	};
}
