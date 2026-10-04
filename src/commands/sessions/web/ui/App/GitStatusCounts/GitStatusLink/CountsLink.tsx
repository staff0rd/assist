import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useDiffPanels } from "../../useDiffPanels";
import { DiffToggleTooltip } from "./CountsLink/DiffToggleTooltip";
import { GitStatusChips, type StatusGroup } from "../GitStatusChips";

const containerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	fontFamily: "monospace",
	whiteSpace: "nowrap",
	border: 0,
	p: 0,
	bgcolor: "transparent",
	cursor: "pointer",
} as const;

export function CountsLink({
	panelSessionId,
	cwd,
	sessionId,
	scope,
	groups,
	bracketed,
	toggleChordHint = false,
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	scope: string;
	groups: StatusGroup[];
	bracketed?: boolean;
	toggleChordHint?: boolean;
}) {
	const { togglePanel } = useDiffPanels();

	return (
		<DiffToggleTooltip show={toggleChordHint}>
			<Link
				component="button"
				type="button"
				onClick={() =>
					togglePanel(panelSessionId, {
						cwd,
						claudeSessionId: sessionId,
						scope,
					})
				}
				variant="caption"
				underline="hover"
				color="inherit"
				sx={containerSx}
			>
				{bracketed && <Box component="span">(</Box>}
				<GitStatusChips groups={groups} />
				{bracketed && <Box component="span">)</Box>}
			</Link>
		</DiffToggleTooltip>
	);
}
