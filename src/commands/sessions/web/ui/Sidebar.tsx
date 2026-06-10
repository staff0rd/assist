import Box from "@mui/material/Box";
import { HistoryList } from "./HistoryList";
import { SessionList } from "./SessionList";
import { SidebarTabs } from "./SidebarTabs";
import type { HistoricalSession, SessionInfo, SidebarTab } from "./types";

type SidebarProps = {
	sessions: SessionInfo[];
	history: HistoricalSession[];
	activeId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelect: (id: string) => void;
	onResume: (session: HistoricalSession) => void;
	onRetry: (id: string) => void;
	onDismiss: (id: string) => void;
	onSetAutoRun: (id: string, enabled: boolean) => void;
	initialized: Set<string>;
};

const sidebarSx = {
	width: 280,
	minWidth: 280,
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
					onDismiss={props.onDismiss}
					onSetAutoRun={props.onSetAutoRun}
				/>
			) : (
				<HistoryList sessions={props.history} onResume={props.onResume} />
			)}
		</Box>
	);
}
