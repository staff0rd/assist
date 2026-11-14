import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import type { PendingRuleChange, RuleScope } from "../../../../../rules/types";
import { RuleChangeCard } from "./RuleChangeCard";
import type { RuleChangeDecision } from "./useRuleChanges";

type Props = {
	changes: PendingRuleChange[];
	scopes: RuleScope[];
	onDecide: (id: string, decision: RuleChangeDecision) => Promise<unknown>;
};

export function RuleChangeReviewPane({ changes, scopes, onDecide }: Props) {
	return (
		<Slide direction="left" in appear>
			<Paper
				variant="outlined"
				component="aside"
				aria-label="Rule changes awaiting approval"
				sx={{
					p: 1.5,
					display: "grid",
					gap: 1.5,
					gridColumn: { xs: "1 / -1", lg: "auto" },
					order: { xs: -1, lg: 0 },
					position: { lg: "sticky" },
					top: (t) => t.spacing(2),
				}}
			>
				<Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
					Awaiting approval
				</Typography>
				<Typography variant="caption" color="text.secondary">
					Nothing is written until you approve; rejecting discards the change.
				</Typography>
				{changes.map((pending) => (
					<RuleChangeCard
						key={pending.id}
						pending={pending}
						scopes={scopes}
						onDecide={onDecide}
					/>
				))}
			</Paper>
		</Slide>
	);
}
