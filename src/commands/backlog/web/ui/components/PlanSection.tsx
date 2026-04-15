import type { PlanPhase } from "../types";
import { PhaseCard, type PhaseStatus } from "./PhaseCard";

type PlanSectionProps = {
	phases: PlanPhase[];
	currentPhase?: number;
	itemId?: number;
	onRewind?: () => Promise<void>;
};

function phaseStatus(
	index: number,
	currentPhase: number | undefined,
): PhaseStatus {
	if (currentPhase === undefined) return "upcoming";
	const phaseNumber = index + 1;
	if (phaseNumber < currentPhase) return "done";
	if (phaseNumber === currentPhase) return "current";
	return "upcoming";
}

export function PlanSection({
	phases,
	currentPhase,
	itemId,
	onRewind,
}: PlanSectionProps) {
	if (phases.length === 0) return null;
	return (
		<div className="mb-4">
			<h3 className="text-xs uppercase text-gray-500 mb-2 tracking-wide">
				Plan
			</h3>
			<div className="space-y-3">
				{phases.map((phase, i) => (
					<PhaseCard
						key={phase.name}
						phase={phase}
						index={i}
						status={phaseStatus(i, currentPhase)}
						itemId={itemId}
						onRewind={onRewind}
					/>
				))}
			</div>
		</div>
	);
}
