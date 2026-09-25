import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { IconButton } from "@mui/material";
import type { PointerEvent as ReactPointerEvent } from "react";
import { criterionGripSx } from "../../criterionRowSx";

export function CriterionGrip({
	number,
	onGrip,
}: {
	number: string;
	onGrip: (event: ReactPointerEvent<HTMLElement>) => void;
}) {
	return (
		<IconButton
			size="small"
			className="criterion-action"
			sx={criterionGripSx}
			aria-label={`Reorder criterion ${number}`}
			onPointerDown={onGrip}
		>
			<DragIndicatorIcon fontSize="inherit" />
		</IconButton>
	);
}
