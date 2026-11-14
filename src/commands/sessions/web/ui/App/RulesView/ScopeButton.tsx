import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import type { RuleScope } from "../../../../../rules/types";
import { ScopeLabel } from "./ScopeLabel";

export function ScopeButton({
	scope,
	selected,
	onSelect,
}: {
	scope: RuleScope;
	selected: boolean;
	onSelect: (id: string) => void;
}) {
	return (
		<ListItemButton
			selected={selected}
			aria-current={selected}
			onClick={() => onSelect(scope.id)}
			sx={{ borderRadius: 1, gap: 1, pl: 1 + scope.depth * 1.75, pr: 1 }}
		>
			<ScopeLabel scope={scope} selected={selected} />
			<Typography
				component="span"
				variant="caption"
				color="text.secondary"
				sx={{ fontVariantNumeric: "tabular-nums" }}
			>
				{scope.rules.length}
			</Typography>
		</ListItemButton>
	);
}
