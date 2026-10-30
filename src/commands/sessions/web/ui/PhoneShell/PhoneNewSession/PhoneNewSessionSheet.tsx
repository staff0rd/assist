import Drawer from "@mui/material/Drawer";
import { useEffect, useState } from "react";
import type { SessionSocket } from "../../useSessionSocket";
import { phoneSheetPaperSx } from "../phoneSheetPaperSx";
import { PhoneNewSessionForm } from "./PhoneNewSessionForm";
import { PhoneRepoPickerView } from "./PhoneRepoPickerView";
import { PhoneSheetNavHeader } from "./PhoneSheetNavHeader";
import { usePhoneNewSession } from "./usePhoneNewSession";

const paperSx = { ...phoneSheetPaperSx, height: "calc(100% - 64px)" };

type Props = {
	open: boolean;
	opens: number;
	onClose: () => void;
	socket: SessionSocket;
};

export function PhoneNewSessionSheet({ open, opens, onClose, socket }: Props) {
	const form = usePhoneNewSession(socket, opens);
	const [pickingRepo, setPickingRepo] = useState(false);
	const { requestHistory } = socket;
	useEffect(() => {
		if (open) requestHistory();
	}, [open, requestHistory]);
	const close = () => {
		setPickingRepo(false);
		onClose();
	};

	return (
		<Drawer
			anchor="bottom"
			open={open}
			onClose={close}
			slotProps={{ paper: { sx: paperSx } }}
		>
			{pickingRepo ? (
				<PhoneRepoPickerView form={form} onBack={() => setPickingRepo(false)} />
			) : (
				<>
					<PhoneSheetNavHeader
						title="New session"
						backLabel="Cancel"
						onBack={close}
					/>
					<PhoneNewSessionForm
						form={form}
						onPickRepo={() => setPickingRepo(true)}
						onSubmit={() => {
							form.submit();
							close();
						}}
					/>
				</>
			)}
		</Drawer>
	);
}
