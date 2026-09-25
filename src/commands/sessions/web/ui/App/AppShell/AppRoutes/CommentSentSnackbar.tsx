import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export function CommentSentSnackbar({
	sessionName,
	onClose,
}: {
	sessionName: string | null;
	onClose: () => void;
}) {
	return (
		<Snackbar
			open={sessionName !== null}
			autoHideDuration={4000}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert severity="success" variant="filled" onClose={onClose}>
				{`Comment sent to ${sessionName}`}
			</Alert>
		</Snackbar>
	);
}
