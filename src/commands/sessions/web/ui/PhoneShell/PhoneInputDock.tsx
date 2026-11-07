import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { PhoneKeyStrip } from "./PhoneKeyStrip";
import { PhoneReplyBar } from "./PhoneReplyBar";

type Props = {
	harness?: HarnessKind;
	waiting: boolean;
	keyboardOpen: boolean;
	onKey: (data: string) => void;
	onSend: (text: string) => void;
};

export function PhoneInputDock({
	harness,
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
			<PhoneReplyBar harness={harness} onSend={onSend} />
		</Box>
	);
}
