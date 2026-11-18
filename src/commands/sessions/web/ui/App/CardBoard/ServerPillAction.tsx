import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import { ActionButton } from "../ActionButton";
import { hasEnded } from "../SessionContent/SessionArea/TerminalArea/TerminalPanes/hasEnded";
import type { SessionInfo } from "../../types";
import { useServerActionsContext } from "../useServerActionsContext";

export function ServerPillAction({ session }: { session: SessionInfo }) {
	const { onStop, onStart } = useServerActionsContext();
	const runName = session.runName ?? session.name;
	if (hasEnded(session.status))
		return (
			<ActionButton
				label="Restart"
				title={`Restart ${runName}`}
				tone="start"
				icon={<RestartAltIcon sx={{ fontSize: 16 }} />}
				onClick={() =>
					onStart(runName, session.cwd, undefined, undefined, session.node)
				}
			/>
		);
	return (
		<ActionButton
			label="Stop"
			title={`Stop ${runName}`}
			tone="stop"
			icon={<StopRoundedIcon sx={{ fontSize: 16 }} />}
			onClick={() => onStop(session.id)}
		/>
	);
}
