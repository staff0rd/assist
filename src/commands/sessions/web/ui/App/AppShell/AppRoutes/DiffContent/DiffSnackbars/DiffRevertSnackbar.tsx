import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export function DiffRevertSnackbar({
	error,
	onClose,
}: {
	error: string | null;
	onClose: () => void;
}) {
	return (
		<Snackbar
			open={error !== null}
			autoHideDuration={6000}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert severity="error" variant="filled" onClose={onClose}>
				{error}
			</Alert>
		</Snackbar>
	);
}
