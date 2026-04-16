import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";

export function FilterTrigger({
	label,
	open,
	onClick,
}: {
	label: string;
	open: boolean;
	onClick: () => void;
}) {
	return (
		<Button
			size="small"
			variant="outlined"
			onClick={onClick}
			endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
			sx={{
				textTransform: "none",
				fontSize: 11,
				justifyContent: "space-between",
				maxWidth: "100%",
				overflow: "hidden",
			}}
			fullWidth
		>
			{label}
		</Button>
	);
}
