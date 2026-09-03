import { ListItemButton, Typography } from "@mui/material";
import type { ScopedRule } from "../../../rules/types";

const rowSx = {
	gap: 1,
	alignItems: "baseline",
	borderRadius: 1,
	py: 0.25,
	pl: 2.5,
	pr: 0.75,
} as const;

const labelSx = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function RuleCitationRow({
	rule,
	onCite,
}: {
	rule: ScopedRule;
	onCite: () => void;
}) {
	return (
		<ListItemButton dense sx={rowSx} title={rule.text} onClick={onCite}>
			<Typography variant="caption" color="primary" sx={{ fontWeight: "bold" }}>
				{rule.code}
			</Typography>
			<Typography variant="caption" sx={labelSx}>
				{rule.title ?? rule.text}
			</Typography>
		</ListItemButton>
	);
}
