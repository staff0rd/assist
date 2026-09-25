import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { formatItemId } from "../../../../../../../backlog/formatItemId";
import { updateItemStatus } from "../../../../../../../backlog/web/ui/api";
import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { ActionButton } from "../../ActionButton";
import type { BacklogTarget } from "../../../../backlogTarget";
import { ErrorSnackbar } from "../../ErrorSnackbar";
import { StopCardActivation } from "../StopCardActivation";

export function CompleteButton({
	target,
	cwd,
	onDismiss,
}: {
	target: BacklogTarget;
	cwd?: string;
	onDismiss: () => void;
}) {
	const { itemId, phase, totalPhases } = target;
	const [confirming, setConfirming] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConfirm = async () => {
		try {
			await updateItemStatus(itemId, "done", cwd);
			setConfirming(false);
			onDismiss();
		} catch {
			setError(`Failed to mark item ${formatItemId(itemId)} as done`);
		}
	};

	return (
		<>
			<ActionButton
				label="Done"
				title="Mark done"
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
						onConfirm={handleConfirm}
						onCancel={() => setConfirming(false)}
					/>
				</StopCardActivation>
			)}
			<StopCardActivation>
				<ErrorSnackbar error={error} onClose={() => setError(null)} />
			</StopCardActivation>
		</>
	);
}
