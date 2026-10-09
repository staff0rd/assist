import TerminalIcon from "@mui/icons-material/Terminal";
import Button from "@mui/material/Button";
import { useActivateSession } from "../../../../sessions/web/ui/useActivateSession";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { useSelectSessionContext } from "../useSelectSessionContext";

export function InFlightSessionButton({ session }: { session: SessionInfo }) {
	const activate = useActivateSession(useSelectSessionContext());
	return (
		<Button
			variant="contained"
			size="small"
			startIcon={<TerminalIcon />}
			onClick={() => activate(session.id)}
		>
			Session {session.id}
		</Button>
	);
}
