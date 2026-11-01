import MoveUpIcon from "@mui/icons-material/MoveUp";
import { useState } from "react";
import { transferCandidates } from "../../transfer/transferCandidates";
import { transferStatus } from "../../transfer/transferStatus";
import { useTransferTargets } from "../../transfer/useTransferTargets";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneSheetItem } from "./PhoneSheetItem";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	onDone: () => void;
};

export function PhoneTransferItem({ session, socket, onDone }: Props) {
	const [open, setOpen] = useState(false);
	const targets = useTransferTargets(session, socket.nodes, open);
	if (transferCandidates(session, socket.nodes).length === 0) return null;
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
			{open && targets === null && <PhoneSheetItem label="Finding nodes…" />}
			{open && targets?.length === 0 && (
				<PhoneSheetItem label="No connected node has this repo" />
			)}
			{open &&
				targets?.map((target) => (
					<PhoneSheetItem
						key={target.node}
						label={target.node}
						detail={target.cwd}
						onClick={() => {
							socket.transferSession(session.id, target.node, target.cwd);
							onDone();
						}}
					/>
				))}
		</>
	);
}
