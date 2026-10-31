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
	confirmColor = "error",
	busy = false,
	autoFocusConfirm = false,
}: {
	onConfirm: () => void;
	onCancel: () => void;
	title?: string;
	message?: string;
	confirmLabel?: string;
	confirmColor?: "error" | "primary";
	busy?: boolean;
	autoFocusConfirm?: boolean;
}) {
	return (
		<Dialog open onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{message}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel} disabled={busy}>
					Cancel
				</Button>
				<Button
					variant="contained"
					color={confirmColor}
					onClick={onConfirm}
					loading={busy}
					autoFocus={autoFocusConfirm}
				>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
