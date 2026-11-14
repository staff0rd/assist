import type { Theme } from "@mui/material/styles";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";

export function ruleRowSx(actionsClass: string, editing: boolean) {
	return {
		display: "grid",
		gridTemplateColumns: (t: Theme) => `${t.spacing(5.5)} minmax(0, 1fr) auto`,
		gap: 1.5,
		px: 2,
		py: 1.5,
		borderBottom: 1,
		borderColor: "divider",
		"&:last-child": { borderBottom: 0 },
		"&:hover": { bgcolor: raisedBgcolor },
		"@media (hover: hover)": {
			[`& .${actionsClass}`]: { opacity: editing ? 1 : 0 },
			[`&:hover .${actionsClass}, &:focus-within .${actionsClass}`]: {
				opacity: 1,
			},
		},
	} as const;
}
