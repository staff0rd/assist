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
	cardProps,
}: {
	group: ReturnType<typeof groupSessionsByRepo>[number];
	cardProps: SessionCardProps;
}) {
	const renderCard = (session: SessionInfo) => (
		<SessionListCard key={session.id} session={session} {...cardProps} />
	);
	return group.kind === "single" ? (
		renderCard(group.session)
	) : (
		<SessionGroupSection label={group.label}>
			{group.sessions.map(renderCard)}
		</SessionGroupSection>
	);
}
