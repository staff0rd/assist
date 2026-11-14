import Alert from "@mui/material/Alert";
import { CommentSentSnackbar } from "../CommentSentSnackbar";

type Props = {
	failure: string | undefined;
	onClearFailure: () => void;
	sentTo: string | null;
	onClearSent: () => void;
};

export function RulesNotices({
	failure,
	onClearFailure,
	sentTo,
	onClearSent,
}: Props) {
	return (
		<>
			{failure && (
				<Alert severity="error" onClose={onClearFailure} sx={{ mb: 2 }}>
					{failure}
				</Alert>
			)}
			<CommentSentSnackbar sessionName={sentTo} onClose={onClearSent} />
		</>
	);
}
