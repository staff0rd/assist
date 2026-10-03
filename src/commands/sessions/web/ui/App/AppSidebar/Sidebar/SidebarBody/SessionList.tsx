import { CardCyclingScrollport } from "./SessionList/CardCyclingScrollport";
import { groupSessionsByRepo } from "../../groupSessionsByRepo";
import { NoSessionsMessage } from "./SessionList/NoSessionsMessage";
import type { PendingLaunch } from "../../../../PendingLaunch";
import { PendingLaunchCard } from "./SessionList/PendingLaunchCard";
import { SessionGroups } from "./SessionList/SessionGroups";
import type { SessionListHandlers } from "../../../../types";
import type { SessionInfo } from "../../../../useSessionSocket";
import { useStarredSessions } from "../../../useStarredSessions";

export function SessionList({
	sessions,
	pendingLaunches,
	activeId,
	initialized,
	onSelect,
	onDismissPending,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
	isFloatingWaiter,
}: {
	sessions: SessionInfo[];
	pendingLaunches: PendingLaunch[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
	onDismissPending: (id: string) => void;
	isFloatingWaiter?: (session: SessionInfo) => boolean;
} & SessionListHandlers) {
	const { isStarred } = useStarredSessions();
	const groups = groupSessionsByRepo(sessions, isStarred, isFloatingWaiter);

	return (
		<CardCyclingScrollport
			sessions={sessions}
			onSelect={onSelect}
			isFloatingWaiter={isFloatingWaiter}
		>
			{pendingLaunches.map((launch) => (
				<PendingLaunchCard
					key={launch.id}
					launch={launch}
					onDismiss={onDismissPending}
				/>
			))}
			<SessionGroups
				groups={groups}
				activeId={activeId}
				initialized={initialized}
				onSelect={onSelect}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
			{sessions.length === 0 && pendingLaunches.length === 0 && (
				<NoSessionsMessage />
			)}
		</CardCyclingScrollport>
	);
}
