import CheckIcon from "@mui/icons-material/Check";
import { ActionButton } from "../../ActionButton";
import type { BacklogTarget } from "../../../backlogTarget";
import type { ChildDismiss, DismissOptions } from "../../../types";
import { ErrorSnackbar } from "../../../ErrorSnackbar";
import type { ShortcutName } from "../../shortcutRegistry";
import { StopCardActivation } from "../../../StopCardActivation";
import { useShiftSkipConfirm } from "../../../useShiftSkipConfirm";
import { MarkDoneConfirmDialog } from "./MarkDoneConfirmDialog";
import { useMarkItemDone } from "./useMarkItemDone";

export function CompleteButton({
	target,
	cwd,
	onDismiss,
	childDismiss,
	shortcut,
}: {
	target: BacklogTarget;
	cwd?: string;
	onDismiss: (opts?: DismissOptions) => void;
	childDismiss?: ChildDismiss;
	shortcut?: ShortcutName;
}) {
	const { busy, error, clearError, confirm } = useMarkItemDone(
		target.itemId,
		cwd,
		() => {
			close();
			onDismiss({ closeServerRuns: true });
			childDismiss?.onDismissChildren();
		},
	);
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		() => void confirm(),
	);

	return (
		<>
			<ActionButton
				label="Done"
				title={withHint("Mark done")}
				ariaLabel="Mark done"
				shortcut={shortcut}
				icon={<CheckIcon sx={{ fontSize: 16 }} />}
				{...triggerHandlers}
			/>
			{confirming && (
				<MarkDoneConfirmDialog
					target={target}
					childDismiss={childDismiss}
					busy={busy}
					onConfirm={confirm}
					onCancel={close}
				/>
			)}
			<StopCardActivation>
				<ErrorSnackbar error={error} onClose={clearError} />
			</StopCardActivation>
		</>
	);
}
