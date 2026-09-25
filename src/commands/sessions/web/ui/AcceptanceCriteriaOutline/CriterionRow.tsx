import { Box, InputBase } from "@mui/material";
import { CriterionGrip } from "./CriterionRow/CriterionGrip";
import { criterionIndent } from "./criterionIndent";
import type { CriterionRowProps } from "./CriterionRow/CriterionRowProps";
import { CriterionRowActions } from "./CriterionRow/CriterionRowActions";
import {
	criterionNumberSx,
	criterionRowSx,
	criterionTextSx,
} from "../criterionRowSx";
import { useCriterionFocus } from "./CriterionRow/useCriterionFocus";

export function CriterionRow({
	index,
	number,
	item,
	outline,
	dragging,
	onGrip,
}: CriterionRowProps) {
	const fieldRef = useCriterionFocus(
		outline.focus?.index === index ? outline.focus : null,
	);
	const rowStyle = {
		marginLeft: criterionIndent(item.depth),
		opacity: dragging ? 0.4 : 1,
	};

	return (
		<Box sx={criterionRowSx} data-criterion-row style={rowStyle}>
			<CriterionGrip number={number} onGrip={onGrip} />
			<Box component="span" sx={criterionNumberSx} aria-hidden="true">
				{`${number}.`}
			</Box>
			<InputBase
				multiline
				value={item.text}
				sx={criterionTextSx}
				inputRef={fieldRef}
				inputProps={{ "aria-label": `Criterion ${number}` }}
				onChange={(e) => outline.onText(index, e.target.value)}
				onKeyDown={(event) => outline.onKeyDown(index, event)}
			/>
			<CriterionRowActions
				number={number}
				onAdd={() => outline.onAdd(index)}
				onDelete={() => outline.onDelete(index)}
			/>
		</Box>
	);
}
