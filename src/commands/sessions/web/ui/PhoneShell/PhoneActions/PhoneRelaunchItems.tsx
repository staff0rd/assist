import ReplayIcon from "@mui/icons-material/Replay";
import { sessionActionHandlers } from "../../App/sessionActionHandlers";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";
import { PhoneSheetItem } from "./PhoneSheetItem";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
	onConfirm: (confirm: PhoneSheetConfirm) => void;
};

export function PhoneRelaunchItems({
	session,
	socket,
	onDone,
	onConfirm,
}: Props) {
	const { onRetry, onRestart, onStartOver } = sessionActionHandlers(session, {
		onRetry: socket.retrySession,
		onRestart: socket.restartSession,
		onStartOver: socket.startOverSession,
		onDismiss: socket.dismissSession,
	});
	const then = (run: () => void) => () => {
		run();
		onDone();
	};
	return (
		<>
			{onRetry && (
				<PhoneSheetItem
					label="Retry session"
					icon={<ReplayIcon fontSize="small" />}
					onClick={then(onRetry)}
				/>
			)}
			{onRestart && (
				<PhoneSheetItem
					label="Restart session"
					icon={<ReplayIcon fontSize="small" />}
					onClick={then(onRestart)}
				/>
			)}
			{onStartOver && (
				<PhoneSheetItem
					label="Start over session"
					icon={<ReplayIcon fontSize="small" />}
					onClick={() => onConfirm("startOver")}
				/>
			)}
		</>
	);
}
