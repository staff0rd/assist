import Alert from "@mui/material/Alert";
import { CommentSentSnackbar } from "../CommentSentSnackbar";
import type { RuleComments } from "./useRuleComments";

type Props = {
	failure: string | undefined;
	onClearFailure: () => void;
	sent: RuleComments["sent"];
	onClearSent: () => void;
};

export function RulesNotices({
	failure,
	onClearFailure,
	sent,
	onClearSent,
}: Props) {
	return (
		<>
			{failure && (
				<Alert severity="error" onClose={onClearFailure} sx={{ mb: 2 }}>
					{failure}
				</Alert>
			)}
			<CommentSentSnackbar
				sessionName={sent?.to ?? null}
				subject={sent?.subject}
				onClose={onClearSent}
			/>
		</>
	);
}
