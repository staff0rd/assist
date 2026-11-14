import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { RuleScope } from "../../../../../rules/types";
import { emptyMessage } from "./emptyMessage";
import type { RuleActions } from "./RuleActions";
import { RuleRow } from "./RuleRow";
import { RuleScopeHeader } from "./RuleScopeHeader";

export function RuleScopePanel({
	scope,
	actions,
}: {
	scope: RuleScope;
	actions: RuleActions;
}) {
	return (
		<Paper
			variant="outlined"
			component="section"
			aria-live="polite"
			sx={{ minWidth: 0 }}
		>
			<RuleScopeHeader scope={scope} />
			{scope.rules.length === 0 ? (
				<Typography
					color={scope.error ? "error" : "text.secondary"}
					align="center"
					sx={{ px: 2, py: 4 }}
				>
					{emptyMessage(scope)}
				</Typography>
			) : (
				<Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
					{scope.rules.map((rule, index) => (
						<RuleRow
							key={`${scope.id}:${rule.code ?? ""}:${index}`}
							rule={rule}
							scope={scope}
							actions={actions}
						/>
					))}
				</Box>
			)}
		</Paper>
	);
}
