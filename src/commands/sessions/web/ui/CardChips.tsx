import Chip from "@mui/material/Chip";
import { JiraKeyLink } from "../../../backlog/web/ui/components/JiraKeyLink";
import { ActivityChips } from "./ActivityChips";
import { HarnessBadge } from "./HarnessBadge";
import { isWindowsCwd } from "./isWindowsCwd";
import { repoLabel } from "./repoLabel";
import { ServingChip } from "./ServingChip";
import type { SessionInfo } from "./types";
import { useJiraKeys } from "./useJiraKeys";
import { WindowsBadge } from "./WindowsBadge";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function CardChips({ session }: { session: SessionInfo }) {
	const repo = repoLabel(session.cwd);
	const jiraKeyFor = useJiraKeys(session.cwd);
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			<ServingChip session={session} />
			<HarnessBadge harness={session.harness} />
			{isWindowsCwd(session.cwd) && <WindowsBadge />}
			<ActivityChips session={session} />
			<JiraKeyLink
				variant="chip"
				jiraKey={jiraKeyFor(session.activity?.itemId)}
			/>
		</>
	);
}
