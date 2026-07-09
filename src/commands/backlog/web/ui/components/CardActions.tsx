import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { canPlay } from "./canPlay";
import { IncompleteSubtasksChip } from "./IncompleteSubtasksChip";
import { InProgressChip } from "./InProgressChip";
import { mostRecentOpenSession } from "./mostRecentOpenSession";
import { PlayAction } from "./PlayAction";
import { StarAction } from "./StarAction";

export function CardActions({
	item,
	socket,
	onReload,
}: {
	item: BacklogItemSummary;
	socket: SessionSocket;
	onReload: () => Promise<void>;
}) {
	const openSession = mostRecentOpenSession(socket.sessions, item.id);
	return (
		<>
			{item.incompleteSubtasks > 0 && (
				<IncompleteSubtasksChip count={item.incompleteSubtasks} />
			)}
			{item.status === "in-progress" && (
				<InProgressChip
					openSession={openSession}
					onSelectSession={socket.selectSession}
				/>
			)}
			<StarAction
				itemId={item.id}
				starred={item.starred}
				onToggled={onReload}
			/>
			{canPlay(item) && <PlayAction itemId={item.id} compact />}
		</>
	);
}
