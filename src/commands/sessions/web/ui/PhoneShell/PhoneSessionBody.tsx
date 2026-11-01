import Box from "@mui/material/Box";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneTerminal } from "./PhoneTerminal";
import { pendingCheck } from "./pendingCheck";
import { pendingPreview } from "./pendingPreview";
import { pendingQuestion } from "./pendingQuestion";
import type { usePhoneSessionIo } from "./usePhoneSessionIo";
import { PhoneSessionAsk } from "./PhoneSessionAsk";

const terminalSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
} as const;

const askTerminalSx = { ...terminalSx, flex: "0 0 22%" } as const;

export function PhoneSessionBody(props: {
	session: SessionInfo;
	socket: SessionSocket;
	io: ReturnType<typeof usePhoneSessionIo>;
	keyboardOpen: boolean;
}) {
	const { session, socket, io } = props;
	const asking = Boolean(
		pendingPreview(session) ??
		pendingQuestion(session) ??
		pendingCheck(session),
	);
	return (
		<>
			<Box sx={asking ? askTerminalSx : terminalSx}>
				<PhoneTerminal
					key={session.id}
					sessionId={session.id}
					cols={session.cols}
					rows={session.rows}
					onOutput={socket.onOutput}
					sendSize={io.sendSize}
					reclaimRef={io.reclaimRef}
				/>
			</Box>
			<PhoneSessionAsk {...props} />
		</>
	);
}
