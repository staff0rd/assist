import { backlogTarget } from "../../backlogTarget";
import { CardPrActions } from "./SessionActionButtons/CardPrActions";
import { CompleteButton } from "./SessionActionButtons/CompleteButton";
import { RestartButton } from "../RestartButton";
import { RetryButton } from "./SessionActionButtons/RetryButton";
import { ServerRunControls } from "./SessionActionButtons/ServerRunControls";
import { SessionStarButton } from "./SessionActionButtons/SessionStarButton";
import { SessionWorkspaceButtons } from "./SessionActionButtons/SessionWorkspaceButtons";
import { TransferButton } from "../../transfer/TransferButton";
import type { ChildDismiss, DismissOptions, SessionInfo } from "../../types";

export function SessionActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
	childDismiss,
}: {
	session: SessionInfo;
	onRetry?: (replace?: boolean) => void;
	onRestart?: () => void;
	onDismiss: (opts?: DismissOptions) => void;
	childDismiss?: ChildDismiss;
}) {
	const stopped = session.status === "stopped" || session.closing === true;
	const target = backlogTarget(session);
	return (
		<>
			<ServerRunControls session={session} />
			<SessionWorkspaceButtons session={session} />
			<CardPrActions session={session} />
			{onRestart && !stopped && (
				<RestartButton
					id={session.id}
					onRestart={onRestart}
					harness={session.harness}
				/>
			)}
			{onRetry && (
				<RetryButton
					id={session.id}
					onRetry={onRetry}
					server={session.server}
					shortcut={session.commandType === "run" ? "focusVsCode" : undefined}
				/>
			)}
			<SessionStarButton session={session} />
			<TransferButton session={session} />
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
