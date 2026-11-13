import { backlogTarget } from "../../backlogTarget";
import { CompleteButton } from "./SessionActionButtons/CompleteButton";
import type { ChildDismiss, DismissOptions, SessionInfo } from "../../types";

export function SessionCompletionAction({
	session,
	onDismiss,
	childDismiss,
}: {
	session: SessionInfo;
	onDismiss: (opts?: DismissOptions) => void;
	childDismiss?: ChildDismiss;
}) {
	const target = backlogTarget(session);
	return (
		<>
			{" "}
			{target && (
				<CompleteButton
					target={target}
					cwd={session.cwd}
					onDismiss={onDismiss}
					childDismiss={childDismiss}
					shortcut="focusDone"
				/>
			)}
		</>
	);
}
