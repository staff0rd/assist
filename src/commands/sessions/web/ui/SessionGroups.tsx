import type { groupSessionsByRepo } from "./groupSessionsByRepo";
import { SessionGroupItem } from "./SessionGroupItem";
import type { SessionListHandlers } from "./types";

export function SessionGroups({
	groups,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	groups: ReturnType<typeof groupSessionsByRepo>;
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
	const cardProps = {
		activeId,
		initialized,
		onSelect,
		onRetry,
		onRestart,
		onDismiss,
		onSetAutoRun,
		onSetAutoAdvance,
	};
	const allSessions = groups.flatMap((group) =>
		group.kind === "single" ? [group.session] : group.sessions,
	);
	return (
		<>
			{groups.map((group) => (
				<SessionGroupItem
					key={group.kind === "single" ? group.session.id : group.key}
					group={group}
					allSessions={allSessions}
					cardProps={cardProps}
				/>
			))}
		</>
	);
}
