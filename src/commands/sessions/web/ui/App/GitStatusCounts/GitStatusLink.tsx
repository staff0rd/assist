import Box from "@mui/material/Box";
import { CountsLink } from "./GitStatusLink/CountsLink";
import type { StatusGroup } from "./GitStatusChips";
import { StopCardActivation } from "../StopCardActivation";

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
	sessionId,
	groups,
	uncommitted,
	toggleChordHint,
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	groups: StatusGroup[];
	uncommitted?: StatusGroup[];
	toggleChordHint?: boolean;
}) {
	return (
		<StopCardActivation>
			<Box sx={rowSx}>
				{groups.length > 0 && (
					<CountsLink
						panelSessionId={panelSessionId}
						cwd={cwd}
						sessionId={sessionId}
						scope="all"
						groups={groups}
						toggleChordHint={toggleChordHint}
					/>
				)}
				{uncommitted && uncommitted.length > 0 && (
					<CountsLink
						panelSessionId={panelSessionId}
						cwd={cwd}
						sessionId={sessionId}
						scope="uncommitted"
						groups={uncommitted}
						bracketed
					/>
				)}
			</Box>
		</StopCardActivation>
	);
}
