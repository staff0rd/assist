import { findServingSessions } from "./findServingSessions";
import { RemoteServingBanner } from "./RemoteServingBanner";
import type { SessionInfo } from "./types";

export function ServingBanners({
	sessions,
	onJump,
}: {
	sessions: SessionInfo[];
	onJump: (id: string) => void;
}) {
	const serving = findServingSessions(sessions);
	if (serving.length === 0) return null;
	return (
		<>
			{serving.map((session) => (
				<RemoteServingBanner
					key={session.id}
					serving={session}
					onJump={() => onJump(session.id)}
				/>
			))}
		</>
	);
}
