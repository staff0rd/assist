import Alert from "@mui/material/Alert";
import { Toast } from "../Toast";

export function CommentSentSnackbar({
	sessionName,
	subject = "Comment",
	onClose,
}: {
	sessionName: string | null;
	subject?: string;
	onClose: () => void;
}) {
	return (
		<Toast
			open={sessionName !== null}
			autoHideDuration={4000}
			onClose={onClose}
		>
			<Alert severity="success" variant="filled" onClose={onClose}>
				{`${subject} sent to ${sessionName}`}
			</Alert>
		</Toast>
	);
}
