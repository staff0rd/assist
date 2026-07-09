import ChecklistIcon from "@mui/icons-material/Checklist";
import { Chip } from "@mui/material";
import { itemCardStyles } from "./itemCardStyles";

export function IncompleteSubtasksChip({ count }: { count: number }) {
	return (
		<Chip
			icon={<ChecklistIcon />}
			label={count}
			size="small"
			variant="outlined"
			sx={itemCardStyles.incompleteSubtasks}
		/>
	);
}
