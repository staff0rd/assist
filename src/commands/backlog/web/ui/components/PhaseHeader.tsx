import type { ChipProps } from "@mui/material";
import { Chip, Stack, Typography } from "@mui/material";
import type { PhaseStatus, PlanPhase } from "../types";
import { RewindAction } from "./RewindAction";

const statusBadge: Record<
	PhaseStatus,
	{ label: string; color: ChipProps["color"] }
> = {
	done: { label: "Done", color: "success" },
	current: { label: "In Progress", color: "info" },
	upcoming: { label: "Upcoming", color: "default" },
};

const headerSx = { alignItems: "center", mb: 1 } as const;

const nameSx = { fontWeight: 500 } as const;

const chipSx = {
	fontWeight: 500,
	fontSize: "0.75rem",
} as const;

export function PhaseHeader({
	phase,
	index,
	status,
	itemId,
	onRewind,
}: {
	phase: PlanPhase;
	index: number;
	status: PhaseStatus;
	itemId?: number;
	onRewind?: () => Promise<void>;
}) {
	const badge = statusBadge[status];
	const canRewind = status === "done" && itemId !== undefined && onRewind;
	return (
		<Stack direction="row" spacing={1} sx={headerSx}>
			<Typography sx={nameSx}>
				Phase {index + 1}: {phase.name}
			</Typography>
			<Chip label={badge.label} size="small" color={badge.color} sx={chipSx} />
			{canRewind && (
				<RewindAction
					itemId={itemId}
					phaseNumber={index + 1}
					phaseName={phase.name}
					onRewound={onRewind}
				/>
			)}
		</Stack>
	);
}
