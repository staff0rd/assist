import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { RESTART_ITEM } from "../../postRestart";

export function RestartConfirmDialog({
	pending,
	onRestart,
	onClose,
}: {
	pending: boolean;
	onRestart: () => void;
	onClose: () => void;
}) {
	return (
		<ConfirmDialog
			title={RESTART_ITEM.label}
			message={RESTART_ITEM.message}
			confirmLabel="Restart"
			busy={pending}
			autoFocusConfirm
			onConfirm={onRestart}
			onCancel={onClose}
		/>
	);
}
