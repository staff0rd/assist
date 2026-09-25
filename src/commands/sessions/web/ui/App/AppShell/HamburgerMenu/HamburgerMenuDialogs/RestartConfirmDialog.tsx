import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";
import { ErrorSnackbar } from "../../../ErrorSnackbar";
import { RESTART_ITEM } from "../../postRestart";
import { useWebserverRestart } from "../../useWebserverRestart";

export function RestartConfirmDialog({
	reconnecting,
	onClose,
}: {
	reconnecting: boolean;
	onClose: () => void;
}) {
	const { pending, error, clearError, restart } = useWebserverRestart(
		RESTART_ITEM.target,
		reconnecting,
	);

	return (
		<>
			<ConfirmDialog
				title={RESTART_ITEM.label}
				message={RESTART_ITEM.message}
				confirmLabel="Restart"
				busy={pending}
				onConfirm={() => void restart()}
				onCancel={onClose}
			/>
			<ErrorSnackbar error={error} onClose={clearError} />
		</>
	);
}
