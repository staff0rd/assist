import { formatItemId } from "../../../formatItemId";
import { ErrorSnackbar } from "../../../../sessions/web/ui/ErrorSnackbar";
import { StopCardActivation } from "../../../../sessions/web/ui/StopCardActivation";
import { type ClosingStatus, closingLabels } from "./closingLabels";
import { ConfirmDialog } from "./ConfirmDialog";
import { useCloseItem } from "./useCloseItem";

export type CloseItemTarget = {
	currentPhase?: number;
	totalPhases?: number;
	onClosed: () => Promise<void>;
};

export function CloseItemDialog({
	itemId,
	status,
	target,
	onClose,
}: {
	itemId: number;
	status: ClosingStatus;
	target: CloseItemTarget;
	onClose: () => void;
}) {
	const { verb, action } = closingLabels[status];
	const label = formatItemId(itemId);
	const { busy, error, clearError, confirm } = useCloseItem(
		itemId,
		async () => {
			onClose();
			await target.onClosed();
		},
	);

	return (
		<StopCardActivation>
			<ConfirmDialog
				title={`Mark ${label} ${verb}`}
				message={`${target.currentPhase ?? 0} of ${target.totalPhases ?? 0} phases completed. Mark this backlog item as ${verb}?`}
				confirmLabel={action}
				busy={busy}
				onConfirm={() => confirm(status)}
				onCancel={onClose}
			/>
			<ErrorSnackbar error={error} onClose={clearError} />
		</StopCardActivation>
	);
}
