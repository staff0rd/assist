import { Box, Stack, Typography } from "@mui/material";
import type { PhaseStatus, PlanPhase } from "../types";
import { PhaseCard } from "./PhaseCard";

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
		<Box sx={{ mb: 2 }}>
			<Typography
				variant="overline"
				sx={{
					color: "text.secondary",
					mb: 1,
					display: "block",
					letterSpacing: "0.08em",
				}}
			>
				Plan
			</Typography>
			<Stack spacing={1.5}>
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
			</Stack>
		</Box>
	);
}
