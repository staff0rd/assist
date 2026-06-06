import { Chip } from "@mui/material";
import { statusChipColors } from "./typeChipColors";

const chipSx = {
	flexShrink: 0,
	fontWeight: 500,
	fontSize: "0.75rem",
	height: 22,
} as const;

export function InProgressChip() {
	return (
		<Chip
			label="in progress"
			size="small"
			color={statusChipColors["in-progress"]}
			sx={chipSx}
		/>
	);
}
