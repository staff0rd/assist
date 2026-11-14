import Typography from "@mui/material/Typography";
import type { RuleScope } from "../../../../../rules/types";
import { scopeWhere } from "./scopeWhere";

const ellipsisSx = {
	display: "block",
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function ScopeLabel({
	scope,
	selected,
}: {
	scope: RuleScope;
	selected: boolean;
}) {
	const where = scopeWhere(scope);
	const mono = scope.kind === "claude-md";
	return (
		<Typography
			component="span"
			variant="body2"
			sx={{ flex: 1, minWidth: 0, fontWeight: selected ? 500 : undefined }}
		>
			<Typography
				component="span"
				variant={mono ? "caption" : "body2"}
				sx={[
					ellipsisSx,
					{ fontWeight: "inherit" },
					mono && { fontFamily: "fontFamilyMono" },
				]}
			>
				{scope.name}
			</Typography>
			{where && (
				<Typography
					component="span"
					variant="caption"
					color="text.secondary"
					sx={ellipsisSx}
				>
					{where}
				</Typography>
			)}
		</Typography>
	);
}
