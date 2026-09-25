import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

type Props = {
	error: string | null;
	onClose: () => void;
};

export function ErrorSnackbar({ error, onClose }: Props) {
	return (
		<Snackbar
			open={error !== null}
			autoHideDuration={8000}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert severity="error" variant="filled" onClose={onClose}>
				{error}
			</Alert>
		</Snackbar>
	);
}
