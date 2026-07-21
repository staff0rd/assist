import { Chip } from "@mui/material";
import { itemCardStyles } from "./itemCardStyles";

export function PhaseProgressChip({
	current,
	total,
}: {
	current: number;
	total: number;
}) {
	return (
		<Chip
			label={`${current}/${total}`}
			size="small"
			variant="outlined"
			sx={itemCardStyles.phaseProgress}
		/>
	);
}
