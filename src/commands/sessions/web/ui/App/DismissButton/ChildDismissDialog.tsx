import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export function ChildDismissDialog({
	childCount,
	onDismissThis,
	onDismissAll,
	onCancel,
}: {
	childCount: number;
	onDismissThis: () => void;
	onDismissAll: () => void;
	onCancel: () => void;
}) {
	const noun = childCount === 1 ? "session" : "sessions";
	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>Close nested sessions?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{`This session has ${childCount} nested ${noun}. Close just this session, or close it along with its nested ${noun}? Running sessions will be stopped.`}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onDismissThis}>Close this only</Button>
				<Button variant="contained" color="error" onClick={onDismissAll}>
					{`Close all ${childCount + 1}`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
