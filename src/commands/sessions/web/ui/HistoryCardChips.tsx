import Chip from "@mui/material/Chip";
import { JiraKeyLink } from "../../../backlog/web/ui/components/JiraKeyLink";
import { BacklogItemChip } from "./BacklogItemChip";
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
				<BacklogItemChip itemId={session.itemId} cwd={session.cwd} />
			)}
			<JiraKeyLink variant="chip" jiraKey={jiraKeyFor(session.itemId)} />
		</>
	);
}
