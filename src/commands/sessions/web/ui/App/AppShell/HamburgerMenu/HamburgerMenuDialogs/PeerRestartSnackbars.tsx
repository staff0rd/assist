import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { ErrorSnackbar } from "../../../ErrorSnackbar";

export function PeerRestartSnackbars({
	back,
	onCloseBack,
	error,
	onCloseError,
}: {
	back: string | null;
	onCloseBack: () => void;
	error: string | null;
	onCloseError: () => void;
}) {
	return (
		<>
			<Snackbar
				open={back !== null}
				autoHideDuration={6000}
				onClose={onCloseBack}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert severity="success" variant="filled" onClose={onCloseBack}>
					{back}
				</Alert>
			</Snackbar>
			<ErrorSnackbar error={error} onClose={onCloseError} />
		</>
	);
}
