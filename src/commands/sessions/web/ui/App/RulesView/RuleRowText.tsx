import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { PendingRuleChange, RuleEntry } from "../../../../../rules/types";
import { PendingPill } from "./PendingPill";
import { ruleChangeLabel } from "./ruleChangeLabel";

export function RuleRowText({
	rule,
	pending,
}: {
	rule: RuleEntry;
	pending: PendingRuleChange | undefined;
}) {
	return (
		<Box sx={{ minWidth: 0 }}>
			{(rule.title || pending) && (
				<Typography variant="body2" sx={{ fontWeight: 500 }}>
					{rule.title}
					{pending && <PendingPill label={ruleChangeLabel(pending.change)} />}
				</Typography>
			)}
			<Typography
				variant="body2"
				color={rule.title ? "text.secondary" : "text.primary"}
				sx={{ mt: 0.25, maxWidth: "72ch", textWrap: "pretty" }}
			>
				{rule.text}
			</Typography>
		</Box>
	);
}
