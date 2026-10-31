import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { formatItemId } from "../../../../../../backlog/formatItemId";
import { ConfirmDialog } from "../../../../../../backlog/web/ui/components/ConfirmDialog";
import { ActionButton } from "../../ActionButton";
import type { BacklogTarget } from "../../../backlogTarget";
import { ErrorSnackbar } from "../../../ErrorSnackbar";
import type { ShortcutName } from "../../shortcutRegistry";
import { StopCardActivation } from "../../../StopCardActivation";
import { useMarkItemDone } from "./useMarkItemDone";

export function CompleteButton({
	target,
	cwd,
	onDismiss,
	shortcut,
}: {
	target: BacklogTarget;
	cwd?: string;
	onDismiss: () => void;
	shortcut?: ShortcutName;
}) {
	const { itemId, phase, totalPhases } = target;
	const [confirming, setConfirming] = useState(false);
	const { busy, error, clearError, confirm } = useMarkItemDone(
		itemId,
		cwd,
		() => {
			setConfirming(false);
			onDismiss();
		},
	);

	return (
		<>
			<ActionButton
				label="Done"
				title="Mark done"
				shortcut={shortcut}
				icon={<CheckIcon sx={{ fontSize: 16 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setConfirming(true);
				}}
			/>
			{confirming && (
				<StopCardActivation>
					<ConfirmDialog
						title={`Mark ${formatItemId(itemId)} done`}
						message={`${phase ?? 0} of ${totalPhases ?? 0} phases completed. Mark this backlog item as done and end its session?`}
						confirmLabel="Mark done"
						autoFocusConfirm
						busy={busy}
						onConfirm={confirm}
						onCancel={() => setConfirming(false)}
					/>
				</StopCardActivation>
			)}
			<StopCardActivation>
				<ErrorSnackbar error={error} onClose={clearError} />
			</StopCardActivation>
		</>
	);
}
