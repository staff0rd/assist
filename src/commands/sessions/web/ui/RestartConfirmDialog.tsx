import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";
import { postRestart, RESTART_ITEMS, type RestartTarget } from "./postRestart";

export function RestartConfirmDialog({
	target,
	onClose,
}: {
	target: RestartTarget;
	onClose: () => void;
}) {
	const item = RESTART_ITEMS.find((i) => i.target === target);
	if (!item) return null;
	return (
		<ConfirmDialog
			title={item.label}
			message={item.message}
			confirmLabel="Restart"
			onConfirm={() => {
				void postRestart(target);
				onClose();
			}}
			onCancel={onClose}
		/>
	);
}
