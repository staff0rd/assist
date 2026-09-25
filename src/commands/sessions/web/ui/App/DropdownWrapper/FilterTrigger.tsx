import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";
import { filterTriggerSx } from "./FilterTrigger/filterTriggerSx";
import { SplitFilterTrigger } from "./FilterTrigger/SplitFilterTrigger";

export function FilterTrigger({
	label,
	open,
	onClick,
	onDefaultAction,
	disabled = false,
}: {
	label: ReactNode;
	open: boolean;
	onClick: () => void;
	onDefaultAction?: () => void;
	disabled?: boolean;
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

	return (
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
}
