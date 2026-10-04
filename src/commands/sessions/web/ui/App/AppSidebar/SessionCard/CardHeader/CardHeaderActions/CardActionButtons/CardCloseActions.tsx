import { DiscardButton } from "./CardCloseActions/DiscardButton";
import { DismissButton } from "../../../../../DismissButton";
import { RestartButton } from "../../../../../RestartButton";
import type { ChildDismiss, SessionInfo } from "../../../../../../types";

export function CardCloseActions({
	session,
	onRestart,
	onDismiss,
	childDismiss,
}: {
	session: SessionInfo;
	onRestart?: () => void;
	onDismiss: () => void;
	childDismiss?: ChildDismiss;
}) {
	const { status, id, harness } = session;
	if (session.closing) return null;
	if (status !== "stopped")
		return (
			<DismissButton
				id={id}
				status={status}
				onDismiss={onDismiss}
				childDismiss={childDismiss}
			/>
		);
	return (
		<>
			{session.undurable && (
				<DiscardButton
					id={id}
					reason={session.undurable.reason}
					path={session.cwd}
					removesTree={session.undurable.removesTree}
				/>
			)}
			{onRestart && (
				<RestartButton id={id} onRestart={onRestart} harness={harness} />
			)}
		</>
	);
}
