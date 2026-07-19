import { Stack } from "@mui/material";
import type { PhaseSession, PhaseUsage, PlanPhase } from "../types";
import { PhaseCard } from "./PhaseCard";
import {
	phaseStatus,
	REVIEW_PHASE,
	sessionsByPhase,
	usageByPhase,
} from "./sessionsByPhase";

type PhaseCardListProps = {
	phases: PlanPhase[];
	currentPhase?: number;
	itemId?: number;
	usage?: PhaseUsage[];
	sessions?: PhaseSession[];
	onRewind?: () => Promise<void>;
};

export function PhaseCardList({
	phases,
	currentPhase,
	itemId,
	usage,
	sessions,
	onRewind,
}: PhaseCardListProps) {
	const byPhase = usageByPhase(usage);
	const sessionsFor = sessionsByPhase(sessions);
	const reviewSessions = (sessions ?? []).filter(
		(s) => s.phaseIdx >= phases.length,
	);
	const allPhases =
		reviewSessions.length > 0 ? [...phases, REVIEW_PHASE] : phases;
	return (
		<Stack spacing={1.5}>
			{allPhases.map((phase, i) => (
				<PhaseCard
					key={phase.name}
					phase={phase}
					index={i}
					status={phaseStatus(i, currentPhase)}
					itemId={itemId}
					usage={byPhase.get(i)}
					sessions={i < phases.length ? sessionsFor.get(i) : reviewSessions}
					onRewind={i < phases.length ? onRewind : undefined}
				/>
			))}
		</Stack>
	);
}
