import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DIFF_TOOLBAR_HEIGHT } from "./DiffToolbar";

const headerSx = {
	position: "sticky",
	top: `${DIFF_TOOLBAR_HEIGHT}px`,
	zIndex: 1,
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	py: 0.5,
	mb: 0.5,
	bgcolor: "background.paper",
	borderBottom: 1,
	borderColor: "divider",
	cursor: "pointer",
} as const;

export function FileDiffHeader({
	path,
	collapsed,
	onToggle,
}: {
	path: string;
	collapsed: boolean;
	onToggle: () => void;
}) {
	return (
		<Box sx={headerSx} onClick={onToggle}>
			{collapsed ? (
				<ChevronRight fontSize="small" />
			) : (
				<ExpandMore fontSize="small" />
			)}
			<Typography
				variant="body2"
				sx={{ fontFamily: "monospace", fontWeight: 700 }}
			>
				{path}
			</Typography>
		</Box>
	);
}
