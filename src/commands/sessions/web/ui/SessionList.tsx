import { SessionCard } from "./SessionCard";
import type { SessionInfo } from "./useSessionSocket";

export function SessionList({
	sessions,
	activeId,
	onSelect,
	onDismiss,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onDismiss: (id: string) => void;
}) {
	return (
		<div style={{ flex: 1, overflow: "auto", padding: 8 }}>
			{sessions.map((s) => (
				<SessionCard
					key={s.id}
					session={s}
					active={s.id === activeId}
					onClick={() => onSelect(s.id)}
					onDismiss={() => onDismiss(s.id)}
				/>
			))}
			{sessions.length === 0 && (
				<div
					style={{
						padding: 16,
						textAlign: "center",
						color: "#666",
						fontSize: 13,
					}}
				>
					No sessions yet
				</div>
			)}
		</div>
	);
}
