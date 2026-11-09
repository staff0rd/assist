import Box from "@mui/material/Box";
import type { ConversationTarget } from "../../../../shared/sessionConversationTarget";
import { CountsLink } from "./GitStatusLink/CountsLink";
import type { StatusGroup } from "./GitStatusChips";
import { StopCardActivation } from "../../StopCardActivation";

const rowSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	minWidth: 0,
} as const;

export const GROUPS = [
	{ key: "new", prefix: "+", color: "success.main" },
	{ key: "modified", prefix: "~", color: "warning.main" },
	{ key: "deleted", prefix: "-", color: "error.main" },
] as const;

export function GitStatusLink({
	panelSessionId,
	cwd,
	conversation,
	groups,
	uncommitted,
	toggleChordHint,
	countButton,
}: {
	panelSessionId: string;
	cwd: string;
	conversation?: ConversationTarget;
	groups: StatusGroup[];
	uncommitted?: StatusGroup[];
	toggleChordHint?: boolean;
	countButton?: boolean;
}) {
	return (
		<StopCardActivation>
			<Box sx={rowSx} data-testid="git-status-counts">
				{groups.length > 0 && (
					<CountsLink
						panelSessionId={panelSessionId}
						cwd={cwd}
						conversation={conversation}
						scope="all"
						groups={groups}
						toggleChordHint={toggleChordHint}
						countButton={countButton}
					/>
				)}
				{uncommitted && uncommitted.length > 0 && (
					<CountsLink
						panelSessionId={panelSessionId}
						cwd={cwd}
						conversation={conversation}
						scope="uncommitted"
						groups={uncommitted}
						bracketed
						countButton={countButton}
					/>
				)}
			</Box>
		</StopCardActivation>
	);
}
