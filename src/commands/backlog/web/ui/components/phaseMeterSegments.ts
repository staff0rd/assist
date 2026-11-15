import type { BacklogItemSummary } from "../types";

export type PhaseSegmentKind = "done" | "current" | "remaining" | "complete";

type PhaseSegments = {
	reached: number;
	total: number;
	label: string;
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
	item: BacklogItemSummary,
): PhaseSegmentKind {
	if (complete) return "complete";
	if (phase < reached || item.donePhases?.includes(phase)) return "done";
	const running = item.runningPhases ?? [];
	if (running.length > 0)
		return running.includes(phase) ? "current" : "remaining";
	return phase === reached ? "current" : "remaining";
}

function meterLabel(
	reached: number,
	total: number,
	segments: { kind: PhaseSegmentKind }[],
	item: BacklogItemSummary,
): string {
	const running = item.runningPhases?.length ?? 0;
	if (item.status !== "in-progress" || running < 2)
		return `${reached}/${total}`;
	const done = segments.filter((segment) => segment.kind === "done").length;
	return `${done}/${total} · ${running} running`;
}

export function phaseMeterSegments(
	item: BacklogItemSummary,
): PhaseSegments | undefined {
	const total = item.totalPhases;
	const reached = reachedPhase(item);
	if (!total || reached == null) return undefined;
	const complete = item.status === "done";
	const segments = Array.from({ length: total }, (_, index) => ({
		phase: index + 1,
		kind: segmentKind(index + 1, reached, complete, item),
	}));
	return {
		reached,
		total,
		label: meterLabel(reached, total, segments, item),
		segments,
	};
}
