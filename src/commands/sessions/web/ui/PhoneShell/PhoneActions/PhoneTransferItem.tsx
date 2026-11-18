import MoveUpIcon from "@mui/icons-material/MoveUp";
import { blockedTransferReason } from "../../transfer/blockedTransferReason";
import { transferCandidates } from "../../transfer/transferCandidates";
import { transferStatus } from "../../transfer/transferStatus";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneCancelTransferItem } from "./PhoneCancelTransferItem";
import { PhoneSheetItem } from "./PhoneSheetItem";
import { PhoneTransferPicker } from "./PhoneTransferPicker";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
};

export function PhoneTransferItem({ session, socket, onDone }: Props) {
	if (transferCandidates(session, socket.nodes).length === 0) {
		const reason = blockedTransferReason(session, socket.nodes);
		if (!reason) return null;
		return (
			<PhoneSheetItem
				label="Transfer to node"
				detail={reason}
				icon={<MoveUpIcon fontSize="small" />}
			/>
		);
	}
	const status = transferStatus(session);
	if (!status.queued)
		return (
			<PhoneTransferPicker session={session} socket={socket} onDone={onDone} />
		);
	return (
		<PhoneCancelTransferItem
			label={status.label}
			onCancel={() => {
				socket.cancelTransfer(session.id);
				onDone();
			}}
		/>
	);
}
