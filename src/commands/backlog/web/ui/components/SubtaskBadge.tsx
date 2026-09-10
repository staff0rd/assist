import ChecklistIcon from "@mui/icons-material/Checklist";
import { Box, Tooltip } from "@mui/material";

const badgeSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.375,
	flexShrink: 0,
	fontSize: "0.71875rem",
	color: "text.secondary",
	"& svg": { fontSize: 14 },
};

export function SubtaskBadge({ count }: { count: number }) {
	if (count < 1) return null;
	return (
		<Tooltip title={`${count} incomplete subtask${count === 1 ? "" : "s"}`}>
			<Box component="span" sx={badgeSx}>
				<ChecklistIcon />
				{count}
			</Box>
		</Tooltip>
	);
}
