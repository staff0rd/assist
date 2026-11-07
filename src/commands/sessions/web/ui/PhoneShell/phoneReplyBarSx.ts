import { raisedBgcolor } from "../designSystem/raisedBgcolor";
import { touchTarget } from "../designSystem/touchTarget";

export const phoneReplyBarSx = {
	bar: {
		flex: "none",
		display: "flex",
		alignItems: "flex-end",
		gap: 1,
		px: 1.5,
		py: 1.25,
		bgcolor: "background.paper",
	},
	field: {
		flex: 1,
		minHeight: touchTarget,
		px: 1.75,
		py: 1,
		borderRadius: "24px",
		border: 1,
		borderColor: "divider",
		bgcolor: "background.default",
		fontSize: 16,
		"&.Mui-focused": { borderColor: "primary.main" },
	},
	send: {
		flex: "none",
		bgcolor: "primary.main",
		color: "primary.contrastText",
		"&:hover": { bgcolor: "primary.main" },
		"&.Mui-disabled": {
			bgcolor: raisedBgcolor,
			color: "text.disabled",
		},
	},
} as const;
