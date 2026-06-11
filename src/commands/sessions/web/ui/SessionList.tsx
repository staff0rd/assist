import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SessionCard } from "./SessionCard";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";

export function SessionList({
	sessions,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
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
					onSetAutoAdvance={(enabled) => onSetAutoAdvance(s.id, enabled)}
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
