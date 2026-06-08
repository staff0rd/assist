import Chip from "@mui/material/Chip";
import { repoLabel } from "./repoLabel";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function CardChips({ session }: { session: SessionInfo }) {
	const repo = repoLabel(session.cwd);
	const { activity } = session;
	const isBacklog = activity?.kind === "backlog";
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			{isBacklog ? (
				<>
					<Chip label={`#${activity.itemId}`} size="small" sx={chipSx} />
					<Chip
						label={`${activity.phase}/${activity.totalPhases}`}
						size="small"
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
