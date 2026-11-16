import Alert from "@mui/material/Alert";
import { Toast } from "../../Toast";

export function PhoneResumingToast({ open }: { open: boolean }) {
	return (
		<Toast open={open}>
			<Alert severity="info" variant="filled">
				Resuming…
			</Alert>
		</Toast>
	);
}
