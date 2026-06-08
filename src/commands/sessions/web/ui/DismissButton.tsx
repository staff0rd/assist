import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";
import type { SessionStatus } from "./types";

export function DismissButton({
	status,
	onDismiss,
}: {
	status: SessionStatus;
	onDismiss: () => void;
}) {
	const [confirming, setConfirming] = useState(false);
	const isDone = status === "done";

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					if (isDone) {
						onDismiss();
					} else {
						setConfirming(true);
					}
				}}
				title="Dismiss"
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<CloseIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<ConfirmDialog
					title="End session"
					message="This will stop the running session and kill its process. Are you sure?"
					confirmLabel="End session"
					onConfirm={() => {
						setConfirming(false);
						onDismiss();
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
		</>
	);
}
