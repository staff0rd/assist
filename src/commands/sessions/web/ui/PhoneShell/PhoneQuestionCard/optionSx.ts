import type { Theme } from "@mui/material/styles";
import { touchTarget } from "../../designSystem/touchTarget";

export function optionSx(checked: boolean) {
	return {
		display: "grid",
		gridTemplateColumns: "auto 1fr auto",
		columnGap: 1.25,
		alignItems: "start",
		minHeight: touchTarget,
		px: 1.5,
		py: 1.25,
		borderRadius: "12px",
		border: 1,
		borderColor: checked ? "primary.main" : "divider",
		bgcolor: checked
			? (t: Theme) => t.tokens.color.selected
			: "background.default",
		cursor: "pointer",
	} as const;
}
