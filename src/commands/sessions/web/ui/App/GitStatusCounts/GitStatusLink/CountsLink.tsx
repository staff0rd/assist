import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useApiNode } from "../../../useApiNode";
import { useDiffPanels } from "../../useDiffPanels";
import { DiffToggleTooltip } from "./CountsLink/DiffToggleTooltip";
import { useCountButton } from "./CountsLink/useCountButton";
import { GitStatusChips, type StatusGroup } from "../GitStatusChips";

const containerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	fontFamily: "fontFamilyMono",
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
	countButton = false,
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	scope: string;
	groups: StatusGroup[];
	bracketed?: boolean;
	toggleChordHint?: boolean;
	countButton?: boolean;
}) {
	const { togglePanel } = useDiffPanels();
	const node = useApiNode();
	const boxed = useCountButton(panelSessionId, scope, countButton);

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
						node,
					})
				}
				variant="caption"
				underline={boxed ? "none" : "hover"}
				color="inherit"
				aria-pressed={boxed?.pressed}
				sx={[containerSx, boxed?.sx ?? {}]}
			>
				{bracketed && <Box component="span">(</Box>}
				<GitStatusChips groups={groups} />
				{bracketed && <Box component="span">)</Box>}
			</Link>
		</DiffToggleTooltip>
	);
}
