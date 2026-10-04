import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import type { ReactNode } from "react";
import { filterTriggerSx } from "./FilterTrigger/filterTriggerSx";
import { SplitFilterTrigger } from "./FilterTrigger/SplitFilterTrigger";

export function FilterTrigger({
	label,
	open,
	onClick,
	onDefaultAction,
	disabled = false,
	tooltip,
}: {
	label: ReactNode;
	open: boolean;
	onClick: () => void;
	onDefaultAction?: () => void;
	disabled?: boolean;
	tooltip?: ReactNode;
}) {
	if (onDefaultAction)
		return (
			<SplitFilterTrigger
				label={label}
				open={open}
				onClick={onClick}
				onDefaultAction={onDefaultAction}
				disabled={disabled}
			/>
		);

	const button = (
		<Button
			size="small"
			variant="outlined"
			disabled={disabled}
			onClick={onClick}
			aria-haspopup="true"
			aria-expanded={open}
			endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
			sx={filterTriggerSx}
			fullWidth
		>
			{label}
		</Button>
	);
	if (!tooltip) return button;
	return (
		<Tooltip describeChild title={tooltip}>
			{button}
		</Tooltip>
	);
}
