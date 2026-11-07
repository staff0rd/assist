import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Toast } from "../../Toast";

export function CommentQueuedToast({
	open,
	onUndo,
	onClose,
}: {
	open: boolean;
	onUndo: () => void;
	onClose: () => void;
}) {
	return (
		<Toast open={open} autoHideDuration={4000} onClose={onClose}>
			<Alert
				severity="success"
				variant="filled"
				action={
					<Button color="inherit" size="small" onClick={onUndo}>
						Undo
					</Button>
				}
			>
				Added to review
			</Alert>
		</Toast>
	);
}
