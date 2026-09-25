import { Box } from "@mui/material";
import { useRef } from "react";
import { criterionNumbers } from "./AcceptanceCriteriaOutline/criterionNumbers";
import { CriterionDropLine } from "./AcceptanceCriteriaOutline/CriterionDropLine";
import { CriterionRow } from "./AcceptanceCriteriaOutline/CriterionRow";
import type { AcceptanceCriterion } from "./splitAcceptanceCriteria";
import { useCriteriaOutline } from "./AcceptanceCriteriaOutline/useCriteriaOutline";
import { useCriterionDrag } from "./AcceptanceCriteriaOutline/useCriterionDrag";

const outlineSx = {
	my: 1,
	px: 1,
	py: 0.5,
	border: 1,
	borderColor: "divider",
	borderRadius: 1,
	position: "relative",
	userSelect: "text",
	cursor: "auto",
} as const;

const EMPTY_ROW: AcceptanceCriterion[] = [{ text: "", depth: 0 }];

export function AcceptanceCriteriaOutline({
	items,
	onChange,
}: {
	items: AcceptanceCriterion[];
	onChange: (items: AcceptanceCriterion[]) => void;
}) {
	const listRef = useRef<HTMLDivElement | null>(null);
	const rows = items.length > 0 ? items : EMPTY_ROW;
	const outline = useCriteriaOutline(rows, onChange);
	const { drag, onGrip } = useCriterionDrag(rows, listRef, outline.onDrop);
	const numbers = criterionNumbers(rows.map((item) => item.depth));

	return (
		<Box
			sx={outlineSx}
			ref={listRef}
			data-preview-skip
			aria-label="Acceptance criteria"
		>
			{rows.map((item, index) => (
				<CriterionRow
					key={`criterion-${index}`}
					index={index}
					number={numbers[index]}
					item={item}
					outline={outline}
					dragging={drag?.from === index}
					onGrip={onGrip(index)}
				/>
			))}
			<CriterionDropLine drag={drag} />
		</Box>
	);
}
