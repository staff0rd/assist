import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../../backlog/web/ui/components/ConfirmDialog";
import { ChildDismissDialog } from "./DismissButton/ChildDismissDialog";
import { StopCardActivation } from "./StopCardActivation";
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
	const close = (dismiss: () => void) => {
		setConfirming(false);
		dismiss();
	};

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					if (status === "done" && !childDismiss) {
						onDismiss();
					} else {
						setConfirming(true);
					}
				}}
				title={`Dismiss session ${id}`}
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<CloseIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<StopCardActivation>
					{childDismiss ? (
						<ChildDismissDialog
							childCount={childDismiss.childCount}
							onDismissThis={() => close(onDismiss)}
							onDismissAll={() => close(childDismiss.onDismissAll)}
							onCancel={() => setConfirming(false)}
						/>
					) : (
						<ConfirmDialog
							title="End session"
							message="This will stop the running session and kill its process. Are you sure?"
							confirmLabel="End session"
							onConfirm={() => close(onDismiss)}
							onCancel={() => setConfirming(false)}
						/>
					)}
				</StopCardActivation>
			)}
		</>
	);
}
