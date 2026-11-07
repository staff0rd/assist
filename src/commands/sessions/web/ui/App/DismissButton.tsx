import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useShiftSkipConfirm } from "../useShiftSkipConfirm";
import { DismissConfirmDialog } from "./DismissButton/DismissConfirmDialog";
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
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		childDismiss?.onDismissAll ?? onDismiss,
		{ needsConfirm: status !== "done" || !!childDismiss },
	);

	return (
		<>
			<IconButton
				size="small"
				{...triggerHandlers}
				title={withHint(`Dismiss session ${id}`)}
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<CloseIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<DismissConfirmDialog
					onDismiss={onDismiss}
					childDismiss={childDismiss}
					onClose={close}
				/>
			)}
		</>
	);
}
