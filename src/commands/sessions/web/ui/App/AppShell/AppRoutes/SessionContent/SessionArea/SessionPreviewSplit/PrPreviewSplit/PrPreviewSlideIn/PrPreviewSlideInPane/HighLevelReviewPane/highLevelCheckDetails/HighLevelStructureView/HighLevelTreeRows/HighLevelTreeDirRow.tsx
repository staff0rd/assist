import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";
import type { HighLevelTreeDir } from "../../../../../../../../../../../../../../../../review/highLevel/types";
import { HighLevelLineCounts } from "../../HighLevelLineCounts";
import {
	highLevelTreeNameSx,
	highLevelTreeRowSx,
} from "../../highLevelTreeRowSx";

export function HighLevelTreeDirRow({
	dir,
	collapsed,
	indent,
	onToggle,
}: {
	dir: HighLevelTreeDir;
	collapsed: boolean;
	indent: string;
	onToggle: () => void;
}) {
	const Chevron = collapsed ? ChevronRightIcon : ExpandMoreIcon;
	return (
		<Box
			component="button"
			type="button"
			onClick={onToggle}
			aria-expanded={!collapsed}
			aria-label={dir.path}
			sx={{
				...highLevelTreeRowSx,
				pl: indent,
				border: 0,
				bgcolor: "transparent",
				cursor: "pointer",
				textAlign: "left",
				color: "inherit",
				font: "inherit",
			}}
		>
			<Chevron sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
			<Typography
				component="span"
				sx={{ ...highLevelTreeNameSx, fontWeight: 600 }}
			>
				{dir.name}
			</Typography>
			<HighLevelLineCounts
				additions={dir.additions}
				deletions={dir.deletions}
			/>
		</Box>
	);
}
