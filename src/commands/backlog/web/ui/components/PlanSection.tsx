import { Box, Stack, Typography } from "@mui/material";
import type { PhaseSession, PhaseUsage, PlanPhase } from "../types";
import { ItemUsageTotal } from "./ItemUsageTotal";
import { PhaseCardList } from "./PhaseCardList";

type PlanSectionProps = {
	phases: PlanPhase[];
	currentPhase?: number;
	itemId?: number;
	usage?: PhaseUsage[];
	sessions?: PhaseSession[];
	onRewind?: () => Promise<void>;
};

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
	sessions,
	onRewind,
}: PlanSectionProps) {
	if (phases.length === 0) return null;
	return (
		<Box sx={{ mb: 2 }}>
			<Stack direction="row" sx={headerRowSx}>
				<Typography variant="overline" sx={overlineSx}>
					Plan
				</Typography>
				{usage && usage.length > 0 && <ItemUsageTotal usage={usage} />}
			</Stack>
			<PhaseCardList
				phases={phases}
				currentPhase={currentPhase}
				itemId={itemId}
				usage={usage}
				sessions={sessions}
				onRewind={onRewind}
			/>
		</Box>
	);
}
