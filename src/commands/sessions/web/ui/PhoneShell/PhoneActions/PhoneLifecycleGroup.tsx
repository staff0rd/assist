import Box from "@mui/material/Box";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneEndItem } from "./PhoneEndItem";
import { PhoneMarkDoneItem } from "./PhoneMarkDoneItem";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";
import { PhoneTransferItem } from "./PhoneTransferItem";
import { PhoneRelaunchItems } from "./PhoneRelaunchItems";

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
	return (
		<Box sx={nodeListSx.group}>
			<PhoneRelaunchItems
				session={session}
				socket={socket}
				onDone={onDone}
				onConfirm={onConfirm}
			/>
			<PhoneTransferItem session={session} socket={socket} onDone={onDone} />
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
