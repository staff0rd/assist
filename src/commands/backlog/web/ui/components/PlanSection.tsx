import { Box, Stack, Typography } from "@mui/material";
import { ItemUsageTotal } from "./ItemUsageTotal";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { PhaseCardList, type PhaseCardListProps } from "./PhaseCardList";
import { sectionHeadingSx } from "./sectionHeadingSx";

const headerRowSx = {
	alignItems: "baseline",
	justifyContent: "space-between",
	mb: 1,
} as const;

const overlineSx = [sectionHeadingSx, { mb: 0 }];

export function PlanSection({
	phases,
	currentPhase,
	runs,
	itemId,
	usage,
	sessions,
	onRewind,
}: PhaseCardListProps) {
	if (phases.length === 0) return null;
	return (
		<Box {...itemSectionAnchor("plan")}>
			<Stack direction="row" sx={headerRowSx}>
				<Typography variant="overline" sx={overlineSx}>
					Plan
				</Typography>
				{usage && usage.length > 0 && <ItemUsageTotal usage={usage} />}
			</Stack>
			<PhaseCardList
				phases={phases}
				currentPhase={currentPhase}
				runs={runs}
				itemId={itemId}
				usage={usage}
				sessions={sessions}
				onRewind={onRewind}
			/>
		</Box>
	);
}
