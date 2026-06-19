import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";

export function UpdateAssistConfirmDialog({
	onConfirm,
	onClose,
}: {
	onConfirm: () => void;
	onClose: () => void;
}) {
	return (
		<ConfirmDialog
			title="Update assist"
			message="This starts a new session running 'assist update'. Its output will appear in the terminal."
			confirmLabel="Update"
			onConfirm={() => {
				onConfirm();
				onClose();
			}}
			onCancel={onClose}
		/>
	);
}
