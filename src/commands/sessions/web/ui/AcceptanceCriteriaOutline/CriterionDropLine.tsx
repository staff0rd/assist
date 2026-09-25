import { Box } from "@mui/material";
import type { CriterionDrag } from "./CriterionDrag";
import { criterionIndent } from "./criterionIndent";
import { criterionDropLineSx } from "../criterionRowSx";

const GUTTER_PX = 8;

export function CriterionDropLine({ drag }: { drag: CriterionDrag | null }) {
	if (!drag) return null;
	return (
		<Box
			sx={criterionDropLineSx}
			style={{
				top: drag.top - 1,
				left: GUTTER_PX + criterionIndent(drag.depth),
			}}
		/>
	);
}
