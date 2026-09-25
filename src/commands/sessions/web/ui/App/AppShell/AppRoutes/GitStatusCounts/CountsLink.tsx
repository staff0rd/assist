import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useDiffPanels } from "../useDiffPanels";

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

export type StatusGroup = {
	key: string;
	prefix: string;
	color: string;
	count: number;
};

function GitStatusChips({ groups }: { groups: StatusGroup[] }) {
	return groups.map((g) => (
		<Box key={g.key} component="span" sx={{ color: g.color }}>
			{g.prefix}
			{g.count}
		</Box>
	));
}

export function CountsLink({
	panelSessionId,
	cwd,
	sessionId,
	scope,
	groups,
	bracketed,
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	scope: string;
	groups: StatusGroup[];
	bracketed?: boolean;
}) {
	const { togglePanel } = useDiffPanels();

	return (
		<Link
			component="button"
			type="button"
			onClick={() =>
				togglePanel(panelSessionId, { cwd, claudeSessionId: sessionId, scope })
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
	);
}
