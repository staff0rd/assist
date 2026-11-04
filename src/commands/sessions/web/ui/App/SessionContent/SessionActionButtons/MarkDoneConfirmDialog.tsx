import { formatItemId } from "../../../../../../backlog/formatItemId";
import { ConfirmDialog } from "../../../../../../backlog/web/ui/components/ConfirmDialog";
import type { BacklogTarget } from "../../../backlogTarget";
import { StopCardActivation } from "../../../StopCardActivation";
import type { ChildDismiss } from "../../../types";
import { markDoneMessage } from "./markDoneMessage";

export function MarkDoneConfirmDialog({
	target,
	childDismiss,
	busy,
	onConfirm,
	onCancel,
}: {
	target: BacklogTarget;
	childDismiss?: ChildDismiss;
	busy: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<StopCardActivation>
			<ConfirmDialog
				title={`Mark ${formatItemId(target.itemId)} done`}
				message={markDoneMessage(target, childDismiss)}
				confirmLabel="Mark done"
				autoFocusConfirm
				busy={busy}
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>
		</StopCardActivation>
	);
}
