import type { PlanPhase } from "../types";
import { PhaseCard, type PhaseStatus } from "./PhaseCard";

type PlanSectionProps = {
	phases: PlanPhase[];
	currentPhase?: number;
};

function phaseStatus(
	index: number,
	currentPhase: number | undefined,
): PhaseStatus {
	if (currentPhase === undefined) return "upcoming";
	if (index < currentPhase) return "done";
	if (index === currentPhase) return "current";
	return "upcoming";
}

export function PlanSection({ phases, currentPhase }: PlanSectionProps) {
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
					/>
				))}
			</div>
		</div>
	);
}
