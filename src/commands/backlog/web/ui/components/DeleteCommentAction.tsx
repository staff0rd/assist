import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Alert, IconButton, Snackbar } from "@mui/material";
import { useState } from "react";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { useRepoCwd } from "../useRepoCwd";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteComment } from "../deleteComment";

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
	const cwd = useRepoCwd();
	const node = useApiNode();
	const [confirming, setConfirming] = useState(false);
	const [error, setError] = useState<string>();
	const closeError = () => setError(undefined);
	return (
		<>
			{confirming && (
				<ConfirmDialog
					message="Are you sure you want to delete this comment?"
					onConfirm={async () => {
						setConfirming(false);
						try {
							await deleteComment(itemId, commentId, cwd, node);
							await onDeleted();
						} catch (error) {
							setError(
								error instanceof Error
									? error.message
									: "Failed to delete comment",
							);
						}
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
			<Snackbar
				open={error !== undefined}
				autoHideDuration={6000}
				onClose={closeError}
			>
				<Alert severity="error" variant="filled" onClose={closeError}>
					{error}
				</Alert>
			</Snackbar>
			<IconButton
				aria-label="Delete comment"
				size="small"
				sx={deleteButtonSx}
				onClick={() => setConfirming(true)}
			>
				<DeleteOutlinedIcon fontSize="inherit" />
			</IconButton>
		</>
	);
}
