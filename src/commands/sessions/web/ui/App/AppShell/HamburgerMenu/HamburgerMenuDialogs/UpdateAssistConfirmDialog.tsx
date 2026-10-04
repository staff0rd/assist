import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";

function dialogText(peer: string | undefined) {
	if (!peer)
		return {
			title: "Update assist",
			message:
				"This starts a new session running 'assist update'. Its output will appear in the terminal.",
		};
	return {
		title: `Update assist on ${peer}?`,
		message: `This runs 'assist update' on ${peer} as a new session, then restarts its web server. This page stays open.`,
	};
}

export function UpdateAssistConfirmDialog({
	peer,
	onConfirm,
	onClose,
}: {
	peer?: string;
	onConfirm: () => void;
	onClose: () => void;
}) {
	return (
		<ConfirmDialog
			{...dialogText(peer)}
			confirmLabel="Update"
			onConfirm={() => {
				onConfirm();
				onClose();
			}}
			onCancel={onClose}
		/>
	);
}
