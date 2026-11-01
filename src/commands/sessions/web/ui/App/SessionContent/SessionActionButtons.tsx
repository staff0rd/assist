import { backlogTarget } from "../../backlogTarget";
import { CardPrActions } from "./SessionActionButtons/CardPrActions";
import { CompleteButton } from "./SessionActionButtons/CompleteButton";
import { RestartButton } from "../RestartButton";
import { RetryButton } from "./SessionActionButtons/RetryButton";
import { ServerRunControls } from "./SessionActionButtons/ServerRunControls";
import { SessionStarButton } from "./SessionActionButtons/SessionStarButton";
import { SessionWorkspaceButtons } from "./SessionActionButtons/SessionWorkspaceButtons";
import { TransferButton } from "../../transfer/TransferButton";
import type { SessionInfo } from "../../types";

export function SessionActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
}: {
	session: SessionInfo;
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
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
					shortcut="focusDone"
				/>
			)}
		</>
	);
}
