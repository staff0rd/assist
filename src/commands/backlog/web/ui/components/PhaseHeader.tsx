import { Chip, Stack, Typography } from "@mui/material";
import type { PhaseStatus, PlanPhase } from "../types";
import { RewindAction } from "./RewindAction";

const statusBadge: Record<
	PhaseStatus,
	{ label: string; bg: string; text: string }
> = {
	done: { label: "Done", bg: "success.light", text: "success.dark" },
	current: { label: "In Progress", bg: "info.light", text: "info.dark" },
	upcoming: {
		label: "Upcoming",
		bg: "action.selected",
		text: "text.secondary",
	},
};

const headerSx = { alignItems: "center", mb: 1 } as const;

const nameSx = { fontWeight: 500 } as const;

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
			<Chip label={badge.label} size="small" sx={chipSx(badge)} />
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

function chipSx(badge: { bg: string; text: string }) {
	return {
		bgcolor: badge.bg,
		color: badge.text,
		fontWeight: 500,
		fontSize: "0.75rem",
	} as const;
}
