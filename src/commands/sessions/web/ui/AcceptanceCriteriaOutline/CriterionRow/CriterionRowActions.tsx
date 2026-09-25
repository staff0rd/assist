import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { criterionActionSx } from "../../criterionRowSx";

export function CriterionRowActions({
	number,
	onAdd,
	onDelete,
}: {
	number: string;
	onAdd: () => void;
	onDelete: () => void;
}) {
	return (
		<>
			<IconButton
				size="small"
				className="criterion-action"
				sx={criterionActionSx}
				aria-label={`Add criterion after ${number}`}
				onClick={onAdd}
			>
				<AddIcon fontSize="inherit" />
			</IconButton>
			<IconButton
				size="small"
				className="criterion-action"
				sx={criterionActionSx}
				aria-label={`Delete criterion ${number}`}
				onClick={onDelete}
			>
				<CloseIcon fontSize="inherit" />
			</IconButton>
		</>
	);
}
