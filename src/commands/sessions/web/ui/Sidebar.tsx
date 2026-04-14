import { HistoryList } from "./HistoryList";
import { NewSessionForm } from "./NewSessionForm";
import { SessionList } from "./SessionList";
import { SidebarTabs } from "./SidebarTabs";
import type { HistoricalSession, SessionInfo, SidebarTab } from "./types";

export function Sidebar({
	sessions,
	history,
	activeId,
	currentCwd,
	tab,
	onTabChange,
	onSelect,
	onCreate,
	onResume,
	onDismiss,
}: {
	sessions: SessionInfo[];
	history: HistoricalSession[];
	activeId: string | null;
	currentCwd: string;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelect: (id: string) => void;
	onCreate: (prompt: string, cwd: string) => void;
	onResume: (session: HistoricalSession) => void;
	onDismiss: (id: string) => void;
}) {
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
				tab={tab}
				activeCount={sessions.length}
				historyCount={history.length}
				onChange={onTabChange}
			/>

			{tab === "active" ? (
				<>
					<SessionList
						sessions={sessions}
						activeId={activeId}
						onSelect={onSelect}
						onDismiss={onDismiss}
					/>
					<NewSessionForm
						currentCwd={currentCwd}
						history={history}
						onCreate={onCreate}
					/>
				</>
			) : (
				<HistoryList sessions={history} onResume={onResume} />
			)}
		</div>
	);
}
