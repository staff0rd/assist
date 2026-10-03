import type { groupSessionsByRepo } from "../../../../groupSessionsByRepo";
import { groupSessionIds } from "./SessionGroupItem/groupSessionIds";
import { NestedSessionRows } from "./SessionGroupItem/NestedSessionRows";
import { SessionGroupSection } from "./SessionGroupItem/SessionGroupSection";
import { SessionListCard } from "./SessionGroupItem/SessionListCard";
import type { SessionListHandlers } from "../../../../../../types";
import type { SessionInfo } from "../../../../../../useSessionSocket";

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
		<SessionGroupSection
			label={group.label}
			sessionIds={groupSessionIds(group.rows)}
			onDismiss={cardProps.onDismiss}
		>
			<NestedSessionRows rows={group.rows} renderCard={renderCard} />
		</SessionGroupSection>
	);
}
