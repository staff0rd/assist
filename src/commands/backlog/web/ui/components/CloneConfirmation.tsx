import { Alert, Snackbar } from "@mui/material";
import { ConfirmDialog } from "./ConfirmDialog";
import type { useCloneOnSelect } from "./useCloneOnSelect";

const snackbarAnchor = { vertical: "bottom", horizontal: "center" } as const;

export function CloneConfirmation({
	clone,
}: {
	clone: ReturnType<typeof useCloneOnSelect>;
}) {
	const { prompt, confirm, cancel, error, dismissError } = clone;
	return (
		<>
			{prompt && (
				<ConfirmDialog
					title="Clone repository"
					message={`Clone ${prompt.displayName} over SSH into ${prompt.cloneTarget}${prompt.node ? ` on ${prompt.node}` : ""}?`}
					confirmLabel="Clone"
					confirmColor="primary"
					onConfirm={confirm}
					onCancel={cancel}
				/>
			)}
			<Snackbar
				open={!!error}
				autoHideDuration={8000}
				onClose={dismissError}
				anchorOrigin={snackbarAnchor}
			>
				<Alert severity="error" onClose={dismissError} variant="filled">
					{error}
				</Alert>
			</Snackbar>
		</>
	);
}
