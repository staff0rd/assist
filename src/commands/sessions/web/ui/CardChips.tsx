import Chip from "@mui/material/Chip";
import { Link } from "react-router";
import { repoLabel } from "./repoLabel";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function CardChips({ session }: { session: SessionInfo }) {
	const repo = repoLabel(session.cwd);
	const { activity } = session;
	const isBacklog = activity?.kind === "backlog";
	// The review phase is the auto-appended final phase, so it's the only one
	// where the current phase equals the (review-inclusive) total.
	const isReview = isBacklog && activity.phase === activity.totalPhases;
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			{isBacklog ? (
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
			) : (
				<Chip
					label={sessionType(session)}
					size="small"
					color="primary"
					variant="outlined"
					sx={chipSx}
				/>
			)}
		</>
	);
}
