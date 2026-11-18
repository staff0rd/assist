import { BoardCard } from "./BoardCard";
import type { SessionInfo } from "../../types";
import { FullWorking } from "./FullWorking";

export function WorkingCard({
	session,
	selected,
	onOpen,
}: {
	session: SessionInfo;
	selected: boolean;
	onOpen: () => void;
}) {
	return (
		<BoardCard
			tone="neutral"
			selected={selected}
			onOpen={onOpen}
			testId="working-card"
		>
			<FullWorking session={session} />
		</BoardCard>
	);
}
