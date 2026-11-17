import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { RuleScope } from "../../../../../rules/types";
import { scopeReach } from "./scopeReach";

type Props = {
	scope: RuleScope;
	adding: boolean;
	onAdd: (() => void) | undefined;
};

export function RuleScopeHeader({ scope, adding, onAdd }: Props) {
	return (
		<Box
			sx={{
				px: 2,
				py: 1.5,
				borderBottom: 1,
				borderColor: "divider",
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: 1.5,
			}}
		>
			<Box sx={{ minWidth: 0 }}>
				<Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
					{scope.name}
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{scopeReach(scope)}
				</Typography>
			</Box>
			{onAdd && (
				<Button
					size="small"
					disabled={adding}
					onClick={onAdd}
					sx={{ flexShrink: 0 }}
				>
					+ Add rule
				</Button>
			)}
		</Box>
	);
}
