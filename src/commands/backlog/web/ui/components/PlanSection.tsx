import { Box, Stack, Typography } from "@mui/material";
import type { PhaseStatus, PhaseUsage, PlanPhase } from "../types";
import { ItemUsageTotal } from "./ItemUsageTotal";
import { PhaseCard } from "./PhaseCard";

type PlanSectionProps = {
	phases: PlanPhase[];
	currentPhase?: number;
	itemId?: number;
	usage?: PhaseUsage[];
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

function usageByPhase(usage: PhaseUsage[] = []): Map<number, PhaseUsage> {
	return new Map(usage.map((u) => [u.phaseIdx, u]));
}

const headerRowSx = {
	alignItems: "baseline",
	justifyContent: "space-between",
	mb: 1,
} as const;

const overlineSx = {
	color: "text.secondary",
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function PlanSection({
	phases,
	currentPhase,
	itemId,
	usage,
	onRewind,
}: PlanSectionProps) {
	if (phases.length === 0) return null;
	const byPhase = usageByPhase(usage);
	return (
		<Box sx={{ mb: 2 }}>
			<Stack direction="row" sx={headerRowSx}>
				<Typography variant="overline" sx={overlineSx}>
					Plan
				</Typography>
				{usage && usage.length > 0 && <ItemUsageTotal usage={usage} />}
			</Stack>
			<Stack spacing={1.5}>
				{phases.map((phase, i) => (
					<PhaseCard
						key={phase.name}
						phase={phase}
						index={i}
						status={phaseStatus(i, currentPhase)}
						itemId={itemId}
						usage={byPhase.get(i)}
						onRewind={onRewind}
					/>
				))}
			</Stack>
		</Box>
	);
}
