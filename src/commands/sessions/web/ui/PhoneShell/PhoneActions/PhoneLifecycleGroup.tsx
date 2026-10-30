import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import Box from "@mui/material/Box";
import { sessionActionHandlers } from "../../App/sessionActionHandlers";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { isFinished } from "./isFinished";
import { PhoneSheetItem } from "./PhoneSheetItem";
import { usePhoneActions } from "./usePhoneActions";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
	onConfirmEnd: () => void;
};

export function PhoneLifecycleGroup({
	session,
	socket,
	onDone,
	onConfirmEnd,
}: Props) {
	const { dismiss } = usePhoneActions();
	const { onRetry, onRestart } = sessionActionHandlers(session, {
		onRetry: socket.retrySession,
		onRestart: socket.restartSession,
		onDismiss: socket.dismissSession,
	});
	const then = (run: () => void) => () => {
		run();
		onDone();
	};
	const finished = isFinished(session);
	return (
		<Box sx={nodeListSx.group}>
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
			<PhoneSheetItem
				label={finished ? "Dismiss" : "End session…"}
				icon={<CloseIcon fontSize="small" />}
				danger
				onClick={finished ? then(() => dismiss(session)) : onConfirmEnd}
			/>
		</Box>
	);
}
