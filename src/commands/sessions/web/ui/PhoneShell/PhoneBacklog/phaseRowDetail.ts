import type {
	PhaseStatus,
	PlanPhase,
} from "../../../../../backlog/web/ui/types";

export function phaseRowDetail(
	phase: PlanPhase,
	index: number,
	status: PhaseStatus,
): string {
	const tasks = phase.tasks.length;
	return [
		`Phase ${index + 1}`,
		`${tasks} ${tasks === 1 ? "task" : "tasks"}`,
		status === "current" ? "next" : undefined,
	]
		.filter(Boolean)
		.join(" · ");
}
