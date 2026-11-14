import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { RuleChangeDecision } from "./useRuleChanges";

type Props = {
	disabled: boolean;
	onDecide: (decision: RuleChangeDecision) => void;
};

export function RuleChangeDecisionButtons({ disabled, onDecide }: Props) {
	return (
		<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
			<Button
				variant="outlined"
				size="small"
				disabled={disabled}
				onClick={() => onDecide("reject")}
			>
				Reject
			</Button>
			<Button
				variant="contained"
				size="small"
				disabled={disabled}
				onClick={() => onDecide("approve")}
			>
				Approve
			</Button>
		</Box>
	);
}
