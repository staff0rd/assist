import Alert from "@mui/material/Alert";
import { Toast } from "../../Toast";

export function PhoneEndedToast({
	open,
	message,
	onClose,
}: {
	open: boolean;
	message: string;
	onClose: () => void;
}) {
	return (
		<Toast
			open={open}
			autoHideDuration={4000}
			onClose={(_, reason) => {
				if (reason !== "clickaway") onClose();
			}}
		>
			<Alert severity="info" variant="filled" onClose={onClose}>
				{message}
			</Alert>
		</Toast>
	);
}
