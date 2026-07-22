import { GroupServingBanner } from "./GroupServingBanner";
import type { groupSessionsByRepo } from "./groupSessionsByRepo";
import { SessionGroupSection } from "./SessionGroupSection";
import { SessionListCard } from "./SessionListCard";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";

type SessionCardProps = {
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers;

export function SessionGroupItem({
	group,
	allSessions,
	cardProps,
}: {
	group: ReturnType<typeof groupSessionsByRepo>[number];
	allSessions: SessionInfo[];
	cardProps: SessionCardProps;
}) {
	const members = group.kind === "single" ? [group.session] : group.sessions;
	const renderCard = (session: SessionInfo) => (
		<SessionListCard key={session.id} session={session} {...cardProps} />
	);
	return (
		<>
			<GroupServingBanner
				members={members}
				allSessions={allSessions}
				onJump={cardProps.onSelect}
			/>
			{group.kind === "single" ? (
				renderCard(group.session)
			) : (
				<SessionGroupSection label={group.label}>
					{group.sessions.map(renderCard)}
				</SessionGroupSection>
			)}
		</>
	);
}
