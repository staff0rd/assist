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
	title = "Confirm deletion",
	message = "Are you sure you want to delete this item?",
	confirmLabel = "Delete",
}: {
	onConfirm: () => void;
	onCancel: () => void;
	title?: string;
	message?: string;
	confirmLabel?: string;
}) {
	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{message}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button variant="contained" color="error" onClick={onConfirm}>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
