import type { SessionInfo } from "../../types";

export type PhaseSegmentState = "done" | "current" | "failed" | "todo";

type PhaseProgress = {
	count: string;
	name: string;
	label: string;
	segments: PhaseSegmentState[];
};

function segmentState(
	index: number,
	phase: number,
	status: SessionInfo["status"],
): PhaseSegmentState {
	if (status === "done" || index < phase) return "done";
	if (index > phase) return "todo";
	return status === "error" ? "failed" : "current";
}

export function phaseProgress(session: SessionInfo): PhaseProgress | undefined {
	const { activity, status } = session;
	if (activity?.kind !== "backlog" || !activity.totalPhases || !activity.phase)
		return undefined;
	const total = activity.totalPhases;
	const done = status === "done";
	const phase = done ? total : Math.min(activity.phase, total);
	const name = done ? "Complete" : (activity.phaseName ?? "");
	const where = `${phase} of ${total}${name ? `: ${name}` : ""}`;
	const label = done
		? `All ${total} phases complete`
		: status === "error"
			? `Stopped in phase ${where}`
			: `Phase ${where}`;
	return {
		count: `${phase}/${total}`,
		name,
		label,
		segments: Array.from({ length: total }, (_, i) =>
			segmentState(i + 1, phase, status),
		),
	};
}
