import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import type { SuccessNotice } from "./useNotices";

type Props = {
	notice: SuccessNotice | null;
	onClose: () => void;
	onView: (sessionId: string) => void;
};

export function LaunchSnackbar({ notice, onClose, onView }: Props) {
	const sessionId = notice?.sessionId ?? null;
	return (
		<Snackbar
			open={notice !== null}
			autoHideDuration={6000}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert
				severity="success"
				variant="filled"
				onClose={onClose}
				action={
					sessionId !== null ? (
						<Button
							color="inherit"
							size="small"
							onClick={() => onView(sessionId)}
						>
							View
						</Button>
					) : undefined
				}
			>
				{notice?.message}
			</Alert>
		</Snackbar>
	);
}
