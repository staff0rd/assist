import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SessionCard } from "./SessionCard";
import type { SessionInfo } from "./useSessionSocket";

export function SessionList({
	sessions,
	activeId,
	onSelect,
	onRetry,
	onDismiss,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onRetry: (id: string) => void;
	onDismiss: (id: string) => void;
}) {
	return (
		<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
			{sessions.map((s) => (
				<SessionCard
					key={s.id}
					session={s}
					active={s.id === activeId}
					onClick={() => onSelect(s.id)}
					onRetry={
						s.commandType === "run" && s.status === "done"
							? () => onRetry(s.id)
							: undefined
					}
					onDismiss={() => onDismiss(s.id)}
				/>
			))}
			{sessions.length === 0 && (
				<Typography
					variant="caption"
					color="text.disabled"
					sx={{ display: "block", textAlign: "center", p: 2 }}
				>
					No sessions yet
				</Typography>
			)}
		</Box>
	);
}
