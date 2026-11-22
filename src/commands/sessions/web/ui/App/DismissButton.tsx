import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { ErrorSnackbar } from "../ErrorSnackbar";
import { StopCardActivation } from "../StopCardActivation";
import { useShiftSkipConfirm } from "../useShiftSkipConfirm";
import { DismissConfirmDialog } from "./DismissButton/DismissConfirmDialog";
import {
	type DismissBacklog,
	useDismissMarkDone,
} from "./DismissButton/useDismissMarkDone";
import type { ChildDismiss, DismissOptions, SessionStatus } from "../types";

export function DismissButton({
	id,
	status,
	onDismiss,
	childDismiss,
	backlog,
}: {
	id: string;
	status: SessionStatus;
	onDismiss: (opts?: DismissOptions) => void;
	childDismiss?: ChildDismiss;
	backlog?: DismissBacklog;
}) {
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		childDismiss?.onDismissAll ?? (() => onDismiss()),
		{ needsConfirm: status !== "done" || !!childDismiss },
	);
	const markDone = useDismissMarkDone(
		backlog,
		onDismiss,
		childDismiss,
		triggerHandlers,
	);

	return (
		<>
			<IconButton
				size="small"
				{...markDone.triggerHandlers}
				title={withHint(`Dismiss session ${id}`, markDone.hint)}
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<CloseIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<DismissConfirmDialog
					onDismiss={() => onDismiss()}
					childDismiss={childDismiss}
					onClose={close}
				/>
			)}
			<StopCardActivation>
				<ErrorSnackbar error={markDone.error} onClose={markDone.clearError} />
			</StopCardActivation>
		</>
	);
}
