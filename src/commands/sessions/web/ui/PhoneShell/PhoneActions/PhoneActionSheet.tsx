import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { phoneSheetPaperSx } from "../phoneSheetPaperSx";
import { PhoneActionSheetHeader } from "./PhoneActionSheetHeader";
import { PhoneEndConfirm } from "./PhoneEndConfirm";
import { PhoneSessionActions } from "./PhoneSessionActions";
import { usePhoneActions } from "./usePhoneActions";

type Props = {
	session: SessionInfo | undefined;
	confirmEnd: boolean;
	onConfirmEnd: () => void;
	onClose: () => void;
	socket: SessionSocket;
};

export function PhoneActionSheet({
	session,
	confirmEnd,
	onConfirmEnd,
	onClose,
	socket,
}: Props) {
	const { dismiss } = usePhoneActions();
	const [last, setLast] = useState(session);
	if (session && session !== last) setLast(session);
	const shown = session ?? last;
	if (!shown) return null;

	const localNode = socket.nodes?.local;
	const linkedNode =
		shown.node && shown.node !== localNode ? shown.node : undefined;

	return (
		<Drawer
			anchor="bottom"
			open={!!session}
			onClose={onClose}
			slotProps={{ paper: { sx: phoneSheetPaperSx } }}
		>
			<PhoneActionSheetHeader session={shown} localNode={localNode} />
			{confirmEnd ? (
				<PhoneEndConfirm
					onEnd={() => {
						dismiss(shown);
						onClose();
					}}
					onCancel={onClose}
				/>
			) : (
				<PhoneSessionActions
					session={shown}
					socket={socket}
					linkedNode={linkedNode}
					onClose={onClose}
					onConfirmEnd={onConfirmEnd}
				/>
			)}
		</Drawer>
	);
}
