import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Alert, IconButton, Snackbar } from "@mui/material";
import { useShiftSkipConfirm } from "../../../../sessions/web/ui/useShiftSkipConfirm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useDeleteComment } from "./useDeleteComment";

const deleteButtonSx = { mt: -0.5, mr: -0.5, color: "text.secondary" } as const;

export function DeleteCommentAction({
	itemId,
	commentId,
	onDeleted,
}: {
	itemId: number;
	commentId: number;
	onDeleted: () => Promise<void>;
}) {
	const { remove, error, clearError } = useDeleteComment(
		itemId,
		commentId,
		onDeleted,
	);
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		() => void remove(),
	);
	return (
		<>
			{confirming && (
				<ConfirmDialog
					message="Are you sure you want to delete this comment?"
					onConfirm={() => {
						close();
						void remove();
					}}
					onCancel={close}
				/>
			)}
			<Snackbar
				open={error !== undefined}
				autoHideDuration={6000}
				onClose={clearError}
			>
				<Alert severity="error" variant="filled" onClose={clearError}>
					{error}
				</Alert>
			</Snackbar>
			<IconButton
				aria-label="Delete comment"
				title={withHint("Delete comment")}
				size="small"
				sx={deleteButtonSx}
				{...triggerHandlers}
			>
				<DeleteOutlinedIcon fontSize="inherit" />
			</IconButton>
		</>
	);
}
