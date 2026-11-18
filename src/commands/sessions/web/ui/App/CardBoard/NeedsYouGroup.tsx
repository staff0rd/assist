import type { SessionInfo } from "../../types";
import { useNowSeconds } from "../useNowSeconds";
import { BoardGroup } from "./BoardGroup";
import { NeedsYouCard } from "./NeedsYouCard";

export function NeedsYouGroup({
	sessions,
	openId,
	onOpen,
}: {
	sessions: SessionInfo[];
	openId: string | undefined;
	onOpen: (id: string) => void;
}) {
	const nowMs = useNowSeconds(30_000) * 1000;
	if (sessions.length === 0) return null;
	return (
		<BoardGroup title="Needs you" color="warning.main" count={sessions.length}>
			{sessions.map((s) => (
				<NeedsYouCard
					key={s.id}
					session={s}
					nowMs={nowMs}
					selected={s.id === openId}
					onOpen={() => onOpen(s.id)}
				/>
			))}
		</BoardGroup>
	);
}
