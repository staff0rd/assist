import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { ErrorSnackbar } from "../../../ErrorSnackbar";

type PeerNotices = {
	back: string | null;
	clearBack: () => void;
	error: string | null;
	clearError: () => void;
	progress?: string | null;
};

export function PeerSnackbars({ notices }: { notices: PeerNotices }) {
	const { back, clearBack, error, clearError, progress } = notices;
	return (
		<>
			<Snackbar
				open={Boolean(progress)}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert severity="info" variant="filled">
					{progress}
				</Alert>
			</Snackbar>
			<Snackbar
				open={back !== null}
				autoHideDuration={6000}
				onClose={clearBack}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert severity="success" variant="filled" onClose={clearBack}>
					{back}
				</Alert>
			</Snackbar>
			<ErrorSnackbar error={error} onClose={clearError} />
		</>
	);
}
