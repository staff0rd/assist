import { isSessionStarting } from "../../../../../../isSessionStarting";
import { SessionCard } from "../../../../../SessionCard";
import { sessionActionHandlers } from "../../../../../../sessionActionHandlers";
import type {
	ChildDismiss,
	SessionListHandlers,
} from "../../../../../../../types";
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
	const childDismiss: ChildDismiss | undefined =
		nestedSessions.length > 0
			? {
					childCount: nestedSessions.length,
					onDismissAll: () => {
						for (const s of [session, ...nestedSessions]) onDismiss(s.id);
					},
				}
			: undefined;

	return (
		<SessionCard
			session={session}
			active={session.id === activeId}
			loading={session.closing || isSessionStarting(session, initialized)}
			onClick={() => onSelect(session.id)}
			onRetry={actions.onRetry}
			onRestart={actions.onRestart}
			onDismiss={actions.onDismiss}
			childDismiss={childDismiss}
			onSetAutoRun={(enabled) => onSetAutoRun(session.id, enabled)}
			onSetAutoAdvance={(enabled) => onSetAutoAdvance(session.id, enabled)}
		/>
	);
}
