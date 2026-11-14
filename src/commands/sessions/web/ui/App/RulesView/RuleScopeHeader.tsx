import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { RuleScope } from "../../../../../rules/types";
import { scopeReach } from "./scopeReach";

export function RuleScopeHeader({ scope }: { scope: RuleScope }) {
	return (
		<Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
			<Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
				{scope.name}
			</Typography>
			<Typography variant="caption" color="text.secondary">
				{scopeReach(scope)}
			</Typography>
		</Box>
	);
}
