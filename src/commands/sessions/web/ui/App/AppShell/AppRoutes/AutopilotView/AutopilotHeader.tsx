import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { repoName } from "../../../../repoName";
import { AutopilotActions } from "./AutopilotActions";
import type { AutopilotAction } from "./postAutopilotControl";

const headSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 1.5,
	mb: 3,
} as const;

export function AutopilotHeader({
	cwd,
	status,
	busy,
	onAction,
}: {
	cwd: string;
	status: AutopilotStatus | null;
	busy: boolean;
	onAction: (action: AutopilotAction) => void;
}) {
	return (
		<Box sx={headSx}>
			<Box>
				<Typography variant="h5" component="h1">
					Autopilot
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ fontFamily: "fontFamilyMono" }}
				>
					{repoName(cwd)}
					{status ? ` · ${status.prompt}` : ""}
				</Typography>
			</Box>
			{status && (
				<AutopilotActions status={status} busy={busy} onAction={onAction} />
			)}
		</Box>
	);
}
