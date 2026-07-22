import { findServingSession } from "./findServingSession";
import { RemoteServingBanner } from "./RemoteServingBanner";
import type { SessionInfo } from "./types";

export function GroupServingBanner({
	members,
	allSessions,
	onJump,
}: {
	members: SessionInfo[];
	allSessions: SessionInfo[];
	onJump: (id: string) => void;
}) {
	const serving = findServingSession(allSessions, members[0]?.remoteOrigin);
	if (!serving || members.some((m) => m.id === serving.id)) return null;
	return (
		<RemoteServingBanner serving={serving} onJump={() => onJump(serving.id)} />
	);
}
