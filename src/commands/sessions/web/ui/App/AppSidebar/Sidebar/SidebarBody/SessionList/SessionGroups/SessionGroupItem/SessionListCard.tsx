import { childDismissFor } from "../../../../../../childDismissFor";
import { isSessionStarting } from "../../../../../../isSessionStarting";
import { SessionCard } from "../../../../../SessionCard";
import { sessionActionHandlers } from "../../../../../../sessionActionHandlers";
import type { SessionListHandlers } from "../../../../../../../types";
import type { SessionInfo } from "../../../../../../../useSessionSocket";

export function SessionListCard({
	session,
	nestedSessions = [],
	activeId,
	initialized,
	onSelect,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	nestedSessions?: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
	const actions = sessionActionHandlers(session, {
		onRetry,
		onRestart,
		onDismiss,
	});
	return (
		<SessionCard
			session={session}
			active={session.id === activeId}
			loading={session.closing || isSessionStarting(session, initialized)}
			onClick={() => onSelect(session.id)}
			onRetry={actions.onRetry}
			onRestart={actions.onRestart}
			onDismiss={actions.onDismiss}
			childDismiss={childDismissFor(session, nestedSessions, onDismiss)}
			onSetAutoRun={(enabled) => onSetAutoRun(session.id, enabled)}
			onSetAutoAdvance={(enabled) => onSetAutoAdvance(session.id, enabled)}
		/>
	);
}
