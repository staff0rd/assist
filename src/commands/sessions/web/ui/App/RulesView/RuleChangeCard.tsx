import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { PendingRuleChange, RuleScope } from "../../../../../rules/types";
import { RuleChangeDecisionButtons } from "./RuleChangeDecisionButtons";
import { RuleChangeRows } from "./RuleChangeRows";
import { ruleChangeSummary } from "./ruleChangeSummary";
import type { RuleChangeDecision } from "./useRuleChanges";

type Props = {
	pending: PendingRuleChange;
	scopes: RuleScope[];
	onDecide: (id: string, decision: RuleChangeDecision) => Promise<unknown>;
};

export function RuleChangeCard({ pending, scopes, onDecide }: Props) {
	const [deciding, setDeciding] = useState(false);
	const { heading, rows, codeNote } = ruleChangeSummary(pending, scopes);
	const decide = async (decision: RuleChangeDecision) => {
		setDeciding(true);
		await onDecide(pending.id, decision);
		setDeciding(false);
	};

	return (
		<Paper
			variant="outlined"
			component="article"
			aria-label={heading}
			sx={{ p: 1.5, display: "grid", gap: 1 }}
		>
			<Typography variant="subtitle2" component="h3">
				{heading}
			</Typography>
			<RuleChangeRows rows={rows} />
			{codeNote && (
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ fontFamily: "fontFamilyMono" }}
				>
					{codeNote}
				</Typography>
			)}
			<RuleChangeDecisionButtons disabled={deciding} onDecide={decide} />
		</Paper>
	);
}
