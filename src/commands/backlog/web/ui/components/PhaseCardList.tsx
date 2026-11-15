import { Stack } from "@mui/material";
import type { PhaseRuns, PhaseSession, PhaseUsage, PlanPhase } from "../types";
import { PhaseCard } from "./PhaseCard";
import { phaseDependencies } from "./phaseDependencies";
import {
	phaseStatus,
	REVIEW_PHASE,
	reviewPhaseIndex,
	sessionsByPhase,
	usageByPhase,
} from "./sessionsByPhase";

export type PhaseCardListProps = {
	phases: PlanPhase[];
	currentPhase?: number;
	runs?: PhaseRuns;
	itemId?: number;
	usage?: PhaseUsage[];
	sessions?: PhaseSession[];
	onRewind?: () => Promise<void>;
};

export function PhaseCardList({
	phases,
	currentPhase,
	runs,
	itemId,
	usage,
	sessions,
	onRewind,
}: PhaseCardListProps) {
	const byPhase = usageByPhase(usage);
	const sessionsFor = sessionsByPhase(sessions);
	const reviewIdx = reviewPhaseIndex(phases);
	const reviewSessions = (sessions ?? []).filter(
		(s) => s.phaseIdx >= reviewIdx,
	);
	const allPhases =
		reviewIdx === phases.length && reviewSessions.length > 0
			? [...phases, REVIEW_PHASE]
			: phases;
	return (
		<Stack spacing={1.5}>
			{allPhases.map((phase, i) => (
				<PhaseCard
					key={phase.name}
					phase={phase}
					index={i}
					status={phaseStatus(i, currentPhase, runs)}
					dependsOn={phaseDependencies(phase, i, currentPhase, runs)}
					itemId={itemId}
					usage={byPhase.get(i)}
					sessions={i === reviewIdx ? reviewSessions : sessionsFor.get(i)}
					onRewind={i < phases.length ? onRewind : undefined}
				/>
			))}
		</Stack>
	);
}
