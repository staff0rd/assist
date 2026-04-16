import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

export function ConfirmDialog({
	onConfirm,
	onCancel,
}: {
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>Confirm deletion</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete this item?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button variant="contained" color="error" onClick={onConfirm}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
