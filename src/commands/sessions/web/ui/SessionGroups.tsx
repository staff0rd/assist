import type { groupSessionsByRepo } from "./groupSessionsByRepo";
import { SessionGroupSection } from "./SessionGroupSection";
import { SessionListCard } from "./SessionListCard";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";

export function SessionGroups({
	groups,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	groups: ReturnType<typeof groupSessionsByRepo>;
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
	const renderCard = (session: SessionInfo) => (
		<SessionListCard
			key={session.id}
			session={session}
			activeId={activeId}
			initialized={initialized}
			onSelect={onSelect}
			onRetry={onRetry}
			onDismiss={onDismiss}
			onSetAutoRun={onSetAutoRun}
			onSetAutoAdvance={onSetAutoAdvance}
		/>
	);

	return (
		<>
			{groups.map((group) =>
				group.kind === "single" ? (
					renderCard(group.session)
				) : (
					<SessionGroupSection key={group.key} label={group.label}>
						{group.sessions.map(renderCard)}
					</SessionGroupSection>
				),
			)}
		</>
	);
}
