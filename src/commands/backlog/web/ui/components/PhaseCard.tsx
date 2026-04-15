import type { PlanPhase } from "../types";
import { ManualChecks } from "./ManualChecks";
import { RewindAction } from "./RewindAction";
import { TaskList } from "./TaskList";

export type PhaseStatus = "done" | "current" | "upcoming";

const statusStyles: Record<PhaseStatus, string> = {
	done: "border-green-300 bg-green-50",
	current: "border-blue-400 bg-blue-50 ring-2 ring-blue-200",
	upcoming: "border-gray-200 bg-white",
};

const statusBadge: Record<PhaseStatus, { label: string; style: string }> = {
	done: { label: "Done", style: "bg-green-100 text-green-700" },
	current: { label: "In Progress", style: "bg-blue-100 text-blue-700" },
	upcoming: { label: "Upcoming", style: "bg-gray-100 text-gray-500" },
};

type PhaseCardProps = {
	phase: PlanPhase;
	index: number;
	status: PhaseStatus;
	itemId?: number;
	onRewind?: () => Promise<void>;
};

export function PhaseCard({
	phase,
	index,
	status,
	itemId,
	onRewind,
}: PhaseCardProps) {
	const badge = statusBadge[status];
	const marker = status === "done" ? "\u2713" : "\u2022";
	const checks = phase.manualChecks ?? [];
	const canRewind = status === "done" && itemId !== undefined && onRewind;
	return (
		<div className={`rounded-lg border p-4 ${statusStyles[status]}`}>
			<div className="flex items-center gap-2 mb-2">
				<span className="font-medium">
					Phase {index + 1}: {phase.name}
				</span>
				<span
					className={`inline-block rounded-full px-2 text-xs font-medium ${badge.style}`}
				>
					{badge.label}
				</span>
				{canRewind && (
					<RewindAction
						itemId={itemId}
						phaseNumber={index + 1}
						phaseName={phase.name}
						onRewound={onRewind}
					/>
				)}
			</div>
			<TaskList tasks={phase.tasks} marker={marker} />
			{checks.length > 0 && <ManualChecks checks={checks} />}
		</div>
	);
}
