import { backlogTarget } from "../backlogTarget";
import { CardPrActions } from "./SessionActionButtons/CardPrActions";
import { CompleteButton } from "./SessionActionButtons/CompleteButton";
import { RestartButton } from "./RestartButton";
import { RetryButton } from "./SessionActionButtons/RetryButton";
import { ServerRunControls } from "./SessionActionButtons/ServerRunControls";
import { SessionStarButton } from "./SessionActionButtons/SessionStarButton";
import { SessionWorkspaceButtons } from "./SessionActionButtons/SessionWorkspaceButtons";
import type { SessionInfo } from "../types";

export function SessionActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
	topBar = false,
}: {
	session: SessionInfo;
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
	topBar?: boolean;
}) {
	const stopped = session.status === "stopped" || session.closing === true;
	const target = backlogTarget(session);
	return (
		<>
			<ServerRunControls session={session} />
			<SessionWorkspaceButtons session={session} topBar={topBar} />
			<CardPrActions session={session} />
			{onRestart && !stopped && (
				<RestartButton
					id={session.id}
					onRestart={onRestart}
					harness={session.harness}
				/>
			)}
			{onRetry && <RetryButton id={session.id} onRetry={onRetry} />}
			<SessionStarButton session={session} />
			{target && (
				<CompleteButton
					target={target}
					cwd={session.cwd}
					onDismiss={onDismiss}
					shortcut={topBar ? "focusDone" : undefined}
				/>
			)}
		</>
	);
}
