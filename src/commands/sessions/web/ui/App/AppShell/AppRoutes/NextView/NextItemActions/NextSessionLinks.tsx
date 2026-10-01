import TerminalIcon from "@mui/icons-material/Terminal";
import Button from "@mui/material/Button";
import type { SessionInfo } from "../../../../../types";
import { useNextSessions } from "../useNextSessions";

export function NextSessionLinks({
	sessions,
	size,
}: {
	sessions: SessionInfo[];
	size: "small" | "medium";
}) {
	const { activate } = useNextSessions();
	return sessions.map((session) => (
		<Button
			key={session.id}
			variant="contained"
			size={size}
			startIcon={<TerminalIcon />}
			onClick={() => activate(session.id)}
		>
			Session {session.id}
		</Button>
	));
}
