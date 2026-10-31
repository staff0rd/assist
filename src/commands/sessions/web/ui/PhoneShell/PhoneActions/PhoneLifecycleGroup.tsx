import ReplayIcon from "@mui/icons-material/Replay";
import Box from "@mui/material/Box";
import { sessionActionHandlers } from "../../App/sessionActionHandlers";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneEndItem } from "./PhoneEndItem";
import { PhoneMarkDoneItem } from "./PhoneMarkDoneItem";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";
import { PhoneSheetItem } from "./PhoneSheetItem";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
	onConfirm: (confirm: PhoneSheetConfirm) => void;
};

export function PhoneLifecycleGroup({
	session,
	socket,
	onDone,
	onConfirm,
}: Props) {
	const { onRetry, onRestart } = sessionActionHandlers(session, {
		onRetry: socket.retrySession,
		onRestart: socket.restartSession,
		onDismiss: socket.dismissSession,
	});
	const then = (run: () => void) => () => {
		run();
		onDone();
	};
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
			<PhoneMarkDoneItem
				session={session}
				onClick={() => onConfirm("markDone")}
			/>
			<PhoneEndItem
				session={session}
				onDone={onDone}
				onConfirmEnd={() => onConfirm("end")}
			/>
		</Box>
	);
}
