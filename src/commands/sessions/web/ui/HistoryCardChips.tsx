import Chip from "@mui/material/Chip";
import { Link } from "react-router";
import { JiraKeyLink } from "../../../backlog/web/ui/components/JiraKeyLink";
import { repoLabel } from "./repoLabel";
import type { HistoricalSession } from "./types";
import { useJiraKeys } from "./useJiraKeys";
import { WindowsBadge } from "./WindowsBadge";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function HistoryCardChips({ session }: { session: HistoricalSession }) {
	const repo = repoLabel(session.cwd);
	const jiraKeyFor = useJiraKeys(session.cwd);
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			{session.origin === "windows" && <WindowsBadge />}
			{session.sessionType && session.sessionType !== "next" && (
				<Chip
					label={session.sessionType}
					size="small"
					color="primary"
					variant="outlined"
					sx={chipSx}
				/>
			)}
			{session.itemId != null && (
				<Chip
					label={`#${session.itemId}`}
					size="small"
					sx={chipSx}
					clickable
					component={Link}
					to={`/backlog/items/${session.itemId}`}
					// The card itself is a ButtonBase; don't let it also select
					onClick={(e) => e.stopPropagation()}
				/>
			)}
			<JiraKeyLink variant="chip" jiraKey={jiraKeyFor(session.itemId)} />
		</>
	);
}
