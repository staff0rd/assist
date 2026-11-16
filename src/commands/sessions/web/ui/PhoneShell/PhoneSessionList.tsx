import Box from "@mui/material/Box";
import { phoneScrollAttr } from "./PhoneNavStack/phoneScrollAttr";
import { useRef } from "react";
import type { SessionInfo } from "../types";
import { PhoneRepoChips } from "./PhoneRepoChips";
import { PhoneFilteredSessions } from "./PhoneRepoChips/PhoneFilteredSessions";
import { useSessionRepoFilter } from "./PhoneRepoChips/useSessionRepoFilter";
import { PhoneSessionsNavBar } from "./PhoneSessionsNavBar";
import { PullIndicator } from "./PullIndicator";
import { usePullToRefresh } from "./usePullToRefresh";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	WebkitOverflowScrolling: "touch",
} as const;

type Props = {
	sessions: SessionInfo[];
	localNode: string | undefined;
	reconnecting: boolean;
	onRefresh: () => void;
	onOpenNodes?: () => void;
	onNewSession?: () => void;
};

export function PhoneSessionList({
	sessions,
	localNode,
	reconnecting,
	onRefresh,
	onOpenNodes,
	onNewSession,
}: Props) {
	const bodyRef = useRef<HTMLDivElement | null>(null);
	const { pull, refreshing } = usePullToRefresh(bodyRef, onRefresh);
	const { repo, selectRepo, chips, shown } = useSessionRepoFilter(sessions);

	return (
		<>
			<PhoneSessionsNavBar
				localNode={localNode}
				reconnecting={reconnecting}
				onOpenNodes={onOpenNodes}
				onNewSession={onNewSession}
			/>
			<PhoneRepoChips
				chips={chips}
				total={sessions.length}
				selected={repo}
				onSelect={selectRepo}
			/>
			<Box ref={bodyRef} sx={bodySx} {...phoneScrollAttr}>
				<PullIndicator pull={pull} refreshing={refreshing} />
				<PhoneFilteredSessions
					sessions={shown}
					repo={repo}
					localNode={localNode}
					onShowAll={() => selectRepo(null)}
				/>
			</Box>
		</>
	);
}
