import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ViewType } from "react-diff-view";

export const DIFF_TOOLBAR_HEIGHT = 52;

const toolbarSx = {
	position: "sticky",
	top: 0,
	zIndex: 2,
	height: DIFF_TOOLBAR_HEIGHT,
	display: "flex",
	alignItems: "center",
	bgcolor: "background.default",
	borderBottom: 1,
	borderColor: "divider",
} as const;

export function DiffToolbar({
	viewType,
	onChange,
}: {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
}) {
	return (
		<Box sx={toolbarSx}>
			<ToggleButtonGroup
				size="small"
				exclusive
				value={viewType}
				onChange={(_, value) => value && onChange(value)}
			>
				<ToggleButton value="unified">Unified</ToggleButton>
				<ToggleButton value="split">Split</ToggleButton>
			</ToggleButtonGroup>
		</Box>
	);
}
