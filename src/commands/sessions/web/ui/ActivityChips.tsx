import Chip from "@mui/material/Chip";
import { Link } from "react-router";
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
				<Chip
					label={`#${activity.itemId}`}
					size="small"
					sx={chipSx}
					clickable
					component={Link}
					to={`/backlog/items/${activity.itemId}`}
					// The card itself is a ButtonBase; don't let it also select
					onClick={(e) => e.stopPropagation()}
				/>
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
				<Chip
					label={`#${activity.itemId}`}
					size="small"
					sx={chipSx}
					clickable
					component={Link}
					to={`/backlog/items/${activity.itemId}`}
					onClick={(e) => e.stopPropagation()}
				/>
			)}
		</>
	);
}
