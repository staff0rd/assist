import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";
import { touchTarget } from "../designSystem/touchTarget";

const rowSx = {
	flex: "none",
	display: "flex",
	px: 1.5,
	pt: 1,
	bgcolor: "background.paper",
} as const;

const chipSx = {
	minHeight: touchTarget,
	maxWidth: "100%",
	px: 1.75,
	borderRadius: "24px",
	border: 1,
	borderColor: "divider",
	bgcolor: raisedBgcolor,
	color: "text.secondary",
	fontSize: 14,
	justifyContent: "flex-start",
	overflow: "hidden",
	whiteSpace: "nowrap",
	textOverflow: "ellipsis",
	display: "block",
	textAlign: "left",
} as const;

export function PhoneSuggestionChip({
	suggestion,
	onPick,
}: {
	suggestion: string;
	onPick: () => void;
}) {
	return (
		<Box sx={rowSx}>
			<ButtonBase
				sx={chipSx}
				onClick={onPick}
				aria-label={`Use suggestion: ${suggestion}`}
			>
				{suggestion}
			</ButtonBase>
		</Box>
	);
}
