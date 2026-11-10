import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { ButtonBase } from "@mui/material";
import { GAP_STEP, type Gap, type GapDirection } from "../../gapAt";

const icons = {
	all: UnfoldMoreIcon,
	down: ArrowDropDownIcon,
	up: ArrowDropUpIcon,
};

function label({ start, end, directions }: Gap, direction: GapDirection) {
	if (direction === "all") return `Show ${(end ?? start) - start} hidden lines`;
	if (directions.length === 1)
		return `Show ${GAP_STEP} lines ${direction === "up" ? "above" : "below"}`;
	return direction === "up"
		? `Show ${GAP_STEP} lines above the next change`
		: `Show ${GAP_STEP} lines below the previous change`;
}

export function GapButtons({
	gap,
	disabled,
	onExpand,
}: {
	gap: Gap;
	disabled: boolean;
	onExpand: (direction: GapDirection) => void;
}) {
	return gap.directions.map((direction) => {
		const Icon = icons[direction];
		return (
			<ButtonBase
				key={direction}
				className="diff-gap-button"
				disabled={disabled}
				onClick={() => onExpand(direction)}
				aria-label={label(gap, direction)}
			>
				<Icon fontSize="small" />
			</ButtonBase>
		);
	});
}
