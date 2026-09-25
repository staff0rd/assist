import Box from "@mui/material/Box";
import { CountsLink, type StatusGroup } from "./CountsLink";
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
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	groups: StatusGroup[];
	uncommitted?: StatusGroup[];
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
