import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { ConversationTarget } from "../../../../../shared/sessionConversationTarget";
import { useOpenDiffPanel } from "../useOpenDiffPanel";
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
	conversation,
	scope,
	groups,
	bracketed,
	toggleChordHint = false,
	countButton = false,
}: {
	panelSessionId: string;
	cwd: string;
	conversation?: ConversationTarget;
	scope: string;
	groups: StatusGroup[];
	bracketed?: boolean;
	toggleChordHint?: boolean;
	countButton?: boolean;
}) {
	const openPanel = useOpenDiffPanel(panelSessionId, cwd, conversation);
	const boxed = useCountButton(panelSessionId, scope, countButton);

	return (
		<DiffToggleTooltip show={toggleChordHint}>
			<Link
				component="button"
				type="button"
				onClick={() => openPanel(scope)}
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
