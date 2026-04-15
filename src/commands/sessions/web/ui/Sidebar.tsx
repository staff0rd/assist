import { ActiveTab, type RunProps } from "./ActiveTab";
import { HistoryList } from "./HistoryList";
import { SidebarTabs } from "./SidebarTabs";
import type { HistoricalSession, SessionInfo, SidebarTab } from "./types";

export type { RunProps } from "./ActiveTab";

type SidebarProps = {
	sessions: SessionInfo[];
	history: HistoricalSession[];
	run: RunProps;
	activeId: string | null;
	currentCwd: string;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelect: (id: string) => void;
	onCreate: (prompt: string, cwd: string) => void;
	onResume: (session: HistoricalSession) => void;
	onRetry: (id: string) => void;
	onDismiss: (id: string) => void;
};

export function Sidebar(props: SidebarProps) {
	return (
		<div
			style={{
				width: 280,
				minWidth: 280,
				borderRight: "1px solid #333",
				display: "flex",
				flexDirection: "column",
				background: "#252526",
			}}
		>
			<SidebarTabs
				tab={props.tab}
				activeCount={props.sessions.length}
				historyCount={props.history.length}
				onChange={props.onTabChange}
			/>

			{props.tab === "active" ? (
				<ActiveTab
					sessions={props.sessions}
					activeId={props.activeId}
					currentCwd={props.currentCwd}
					history={props.history}
					run={props.run}
					onSelect={props.onSelect}
					onCreate={props.onCreate}
					onRetry={props.onRetry}
					onDismiss={props.onDismiss}
				/>
			) : (
				<HistoryList sessions={props.history} onResume={props.onResume} />
			)}
		</div>
	);
}
