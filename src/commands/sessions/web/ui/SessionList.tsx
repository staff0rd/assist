import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SessionCard } from "./SessionCard";
import type { SessionInfo } from "./useSessionSocket";

export function SessionList({
	sessions,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onDismiss,
	onSetAutoRun,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
	onRetry: (id: string) => void;
	onDismiss: (id: string) => void;
	onSetAutoRun: (id: string, enabled: boolean) => void;
}) {
	return (
		<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
			{sessions.map((s) => (
				<SessionCard
					key={s.id}
					session={s}
					active={s.id === activeId}
					loading={!initialized.has(s.id)}
					onClick={() => onSelect(s.id)}
					onRetry={
						(s.commandType === "run" || s.commandType === "assist") &&
						s.status === "done"
							? () => onRetry(s.id)
							: undefined
					}
					onDismiss={() => onDismiss(s.id)}
					onSetAutoRun={(enabled) => onSetAutoRun(s.id, enabled)}
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
