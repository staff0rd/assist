import { transferCandidates } from "../../transfer/transferCandidates";
import { transferStatus } from "../../transfer/transferStatus";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneCancelTransferItem } from "./PhoneCancelTransferItem";
import { PhoneTransferPicker } from "./PhoneTransferPicker";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
};

export function PhoneTransferItem({ session, socket, onDone }: Props) {
	if (transferCandidates(session, socket.nodes).length === 0) return null;
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
