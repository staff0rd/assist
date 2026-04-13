import { NewSessionForm } from "./NewSessionForm";
import { SessionList } from "./SessionList";
import type { SessionInfo } from "./useSessionSocket";

export function Sidebar({
	sessions,
	activeId,
	onSelect,
	onCreate,
	onDismiss,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onCreate: (prompt: string) => void;
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
			<div
				style={{
					padding: "12px 16px",
					borderBottom: "1px solid #333",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<span
					style={{
						fontSize: 13,
						fontWeight: 600,
						color: "#ccc",
						letterSpacing: 0.5,
						textTransform: "uppercase",
					}}
				>
					Sessions
				</span>
				<span style={{ fontSize: 12, color: "#666" }}>{sessions.length}</span>
			</div>

			<SessionList
				sessions={sessions}
				activeId={activeId}
				onSelect={onSelect}
				onDismiss={onDismiss}
			/>

			<NewSessionForm onCreate={onCreate} />
		</div>
	);
}
