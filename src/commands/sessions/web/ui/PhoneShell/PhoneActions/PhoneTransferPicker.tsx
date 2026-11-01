import MoveUpIcon from "@mui/icons-material/MoveUp";
import { useState } from "react";
import { transferStatus } from "../../transfer/transferStatus";
import { useTransferTargets } from "../../transfer/useTransferTargets";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneSheetItem } from "./PhoneSheetItem";
import { PhoneTransferTargets } from "./PhoneTransferTargets";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
};

export function PhoneTransferPicker({ session, socket, onDone }: Props) {
	const [open, setOpen] = useState(false);
	const targets = useTransferTargets(session, socket.nodes, open);
	const status = transferStatus(session);
	const detail = status.failed || status.pending ? status.title : undefined;
	return (
		<>
			<PhoneSheetItem
				label={status.failed ? status.label : "Transfer to node"}
				detail={detail}
				danger={status.failed}
				icon={<MoveUpIcon fontSize="small" />}
				onClick={status.pending ? undefined : () => setOpen(!open)}
			/>
			{open && (
				<PhoneTransferTargets
					targets={targets}
					onPick={(target) => {
						socket.transferSession(session.id, target.node, target.cwd);
						onDone();
					}}
				/>
			)}
		</>
	);
}
