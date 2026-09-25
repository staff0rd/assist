import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

export function ReconnectingIndicator({
	reconnecting,
}: {
	reconnecting: boolean;
}) {
	return (
		<Snackbar
			open={reconnecting}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert
				severity="info"
				variant="filled"
				icon={<CircularProgress size={16} color="inherit" />}
			>
				Reconnecting…
			</Alert>
		</Snackbar>
	);
}
