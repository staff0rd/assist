import Box from "@mui/material/Box";
import { HistoryList } from "./HistoryList";
import { SessionList } from "./SessionList";
import { SidebarTabs } from "./SidebarTabs";
import type {
	HistoricalSession,
	SessionInfo,
	SessionListHandlers,
	SidebarTab,
} from "./types";

type SidebarProps = {
	sessions: SessionInfo[];
	history: HistoricalSession[];
	activeId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelect: (id: string) => void;
	onView: (session: HistoricalSession) => void;
	onResume: (session: HistoricalSession) => void;
	initialized: Set<string>;
} & SessionListHandlers;

const sidebarSx = {
	width: "25%",
	borderRight: 1,
	borderColor: "divider",
	display: "flex",
	flexDirection: "column",
	bgcolor: "background.paper",
} as const;

export function Sidebar(props: SidebarProps) {
	return (
		<Box sx={sidebarSx}>
			<SidebarTabs
				tab={props.tab}
				activeCount={props.sessions.length}
				historyCount={props.history.length}
				onChange={props.onTabChange}
			/>

			{props.tab === "active" ? (
				<SessionList
					sessions={props.sessions}
					activeId={props.activeId}
					initialized={props.initialized}
					onSelect={props.onSelect}
					onRetry={props.onRetry}
					onRestart={props.onRestart}
					onDismiss={props.onDismiss}
					onSetAutoRun={props.onSetAutoRun}
					onSetAutoAdvance={props.onSetAutoAdvance}
				/>
			) : (
				<HistoryList
					sessions={props.history}
					onView={props.onView}
					onResume={props.onResume}
				/>
			)}
		</Box>
	);
}
