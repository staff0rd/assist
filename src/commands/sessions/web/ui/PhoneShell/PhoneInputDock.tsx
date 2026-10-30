import Box from "@mui/material/Box";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { PhoneKeyStrip } from "./PhoneKeyStrip";
import { PhoneReplyBar } from "./PhoneReplyBar";

type Props = {
	waiting: boolean;
	keyboardOpen: boolean;
	onKey: (data: string) => void;
	onSend: (text: string) => void;
};

export function PhoneInputDock({
	waiting,
	keyboardOpen,
	onKey,
	onSend,
}: Props) {
	return (
		<Box
			sx={{
				flex: "none",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
				pb: keyboardOpen ? 0 : safeAreaInsets.bottom,
			}}
		>
			<Box sx={{ order: keyboardOpen ? 1 : 0 }}>
				<PhoneKeyStrip waiting={waiting} onKey={onKey} />
			</Box>
			<PhoneReplyBar onSend={onSend} />
		</Box>
	);
}
