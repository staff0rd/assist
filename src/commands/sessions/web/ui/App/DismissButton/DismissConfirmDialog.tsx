import { ConfirmDialog } from "../../../../../backlog/web/ui/components/ConfirmDialog";
import { StopCardActivation } from "../../StopCardActivation";
import type { ChildDismiss } from "../../types";
import { ChildDismissDialog } from "./ChildDismissDialog";

export function DismissConfirmDialog({
	onDismiss,
	childDismiss,
	onClose,
}: {
	onDismiss: () => void;
	childDismiss?: ChildDismiss;
	onClose: () => void;
}) {
	const close = (dismiss: () => void) => {
		onClose();
		dismiss();
	};

	return (
		<StopCardActivation>
			{childDismiss ? (
				<ChildDismissDialog
					childCount={childDismiss.childCount}
					onDismissThis={() => close(onDismiss)}
					onDismissAll={() => close(childDismiss.onDismissAll)}
					onCancel={onClose}
				/>
			) : (
				<ConfirmDialog
					title="End session"
					message="This will stop the running session and kill its process. Are you sure?"
					confirmLabel="End session"
					onConfirm={() => close(onDismiss)}
					onCancel={onClose}
				/>
			)}
		</StopCardActivation>
	);
}
