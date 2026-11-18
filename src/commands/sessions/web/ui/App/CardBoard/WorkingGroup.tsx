import type { SessionInfo } from "../../types";
import { BoardGroup } from "./BoardGroup";
import { WorkingCard } from "./WorkingCard";

export function WorkingGroup({
	sessions,
	openId,
	compact,
	onOpen,
}: {
	sessions: SessionInfo[];
	openId: string | undefined;
	compact: boolean;
	onOpen: (id: string) => void;
}) {
	if (sessions.length === 0) return null;
	return (
		<BoardGroup
			title="Working"
			color="success.main"
			count={sessions.length}
			compact={compact}
		>
			{sessions.map((s) => (
				<WorkingCard
					key={s.id}
					session={s}
					selected={s.id === openId}
					compact={compact}
					onOpen={() => onOpen(s.id)}
				/>
			))}
		</BoardGroup>
	);
}
