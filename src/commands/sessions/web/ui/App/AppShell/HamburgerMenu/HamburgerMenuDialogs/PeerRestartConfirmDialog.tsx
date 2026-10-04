import { useState } from "react";
import { ConfirmDialog } from "../../../../../../../backlog/web/ui/components/ConfirmDialog";

export function PeerRestartConfirmDialog({
	peer,
	onRestart,
	onClose,
}: {
	peer: string;
	onRestart: (peer: string) => Promise<boolean>;
	onClose: () => void;
}) {
	const [pending, setPending] = useState(false);

	return (
		<ConfirmDialog
			title={`Restart ${peer}?`}
			message={`Restarts the sessions daemon and web server on ${peer}. Its sessions resume when the daemon is back. This page stays open.`}
			confirmLabel="Restart"
			busy={pending}
			onConfirm={() => {
				setPending(true);
				void onRestart(peer).finally(onClose);
			}}
			onCancel={onClose}
		/>
	);
}
