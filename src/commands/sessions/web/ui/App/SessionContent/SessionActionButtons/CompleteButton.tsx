import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { ActionButton } from "../../ActionButton";
import type { BacklogTarget } from "../../../backlogTarget";
import type { ChildDismiss, DismissOptions } from "../../../types";
import { ErrorSnackbar } from "../../../ErrorSnackbar";
import type { ShortcutName } from "../../shortcutRegistry";
import { StopCardActivation } from "../../../StopCardActivation";
import { shiftSkipsConfirmHandlers } from "./shiftSkipsConfirmHandlers";
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
	const [confirming, setConfirming] = useState(false);
	const { busy, error, clearError, confirm } = useMarkItemDone(
		target.itemId,
		cwd,
		() => {
			setConfirming(false);
			onDismiss({ closeServerRuns: true });
			childDismiss?.onDismissChildren();
		},
	);

	return (
		<>
			<ActionButton
				label="Done"
				title="Mark done (Shift skips confirmation)"
				ariaLabel="Mark done"
				shortcut={shortcut}
				icon={<CheckIcon sx={{ fontSize: 16 }} />}
				{...shiftSkipsConfirmHandlers(
					() => void confirm(),
					() => setConfirming(true),
				)}
			/>
			{confirming && (
				<MarkDoneConfirmDialog
					target={target}
					childDismiss={childDismiss}
					busy={busy}
					onConfirm={confirm}
					onCancel={() => setConfirming(false)}
				/>
			)}
			<StopCardActivation>
				<ErrorSnackbar error={error} onClose={clearError} />
			</StopCardActivation>
		</>
	);
}
