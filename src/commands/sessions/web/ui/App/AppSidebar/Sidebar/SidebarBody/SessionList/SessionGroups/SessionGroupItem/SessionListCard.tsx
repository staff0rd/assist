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
	onStartOver,
	onDismiss,
	onSetAutoApprove,
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
		onStartOver,
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
			onStartOver={actions.onStartOver}
			onDismiss={actions.onDismiss}
			childDismiss={childDismissFor(session, nestedSessions, onDismiss)}
			onSetAutoApprove={(enabled) => onSetAutoApprove(session.id, enabled)}
			onSetAutoAdvance={(enabled) => onSetAutoAdvance(session.id, enabled)}
		/>
	);
}
