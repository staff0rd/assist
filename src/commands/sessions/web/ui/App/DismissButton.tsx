import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { DismissConfirmDialog } from "./DismissButton/DismissConfirmDialog";
import { shiftSkipsConfirmHandlers } from "./SessionContent/SessionActionButtons/shiftSkipsConfirmHandlers";
import type { ChildDismiss, SessionStatus } from "../types";

export function DismissButton({
	id,
	status,
	onDismiss,
	childDismiss,
}: {
	id: string;
	status: SessionStatus;
	onDismiss: () => void;
	childDismiss?: ChildDismiss;
}) {
	const [confirming, setConfirming] = useState(false);

	return (
		<>
			<IconButton
				size="small"
				{...shiftSkipsConfirmHandlers(
					childDismiss?.onDismissAll ?? onDismiss,
					() => {
						if (status === "done" && !childDismiss) onDismiss();
						else setConfirming(true);
					},
				)}
				title={`Dismiss session ${id} (Shift skips confirmation)`}
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<CloseIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<DismissConfirmDialog
					onDismiss={onDismiss}
					childDismiss={childDismiss}
					onClose={() => setConfirming(false)}
				/>
			)}
		</>
	);
}
