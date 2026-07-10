import Chip from "@mui/material/Chip";
import { BacklogItemChip } from "./BacklogItemChip";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function ActivityChips({ session }: { session: SessionInfo }) {
	const { activity } = session;
	const isBacklog = activity?.kind === "backlog";
	// The review phase is the auto-appended final phase, so it's the only one
	// where the current phase equals the (review-inclusive) total.
	const isReview = isBacklog && activity.phase === activity.totalPhases;
	if (isBacklog)
		return (
			<>
				{activity.itemId != null && (
					<BacklogItemChip itemId={activity.itemId} cwd={session.cwd} />
				)}
				<Chip
					label={`${activity.phase}/${activity.totalPhases}`}
					size="small"
					color={isReview ? "primary" : "default"}
					sx={chipSx}
				/>
			</>
		);
	return (
		<>
			<Chip
				label={sessionType(session)}
				size="small"
				color="primary"
				variant="outlined"
				sx={chipSx}
			/>
			{activity?.itemId != null && (
				<BacklogItemChip itemId={activity.itemId} cwd={session.cwd} />
			)}
		</>
	);
}
