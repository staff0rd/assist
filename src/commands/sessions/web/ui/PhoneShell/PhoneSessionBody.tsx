import Box from "@mui/material/Box";
import { displayStatus } from "../displayStatus";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneInputDock } from "./PhoneInputDock";
import { PhoneSessionQuestion } from "./PhoneSessionQuestion";
import { PhoneTerminal } from "./PhoneTerminal";
import { pendingQuestion } from "./pendingQuestion";
import type { usePhoneSessionIo } from "./usePhoneSessionIo";

const terminalSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
} as const;

const questionTerminalSx = { ...terminalSx, flex: "0 0 22%" } as const;

export function PhoneSessionBody({
	session,
	socket,
	io,
	keyboardOpen,
}: {
	session: SessionInfo;
	socket: SessionSocket;
	io: ReturnType<typeof usePhoneSessionIo>;
	keyboardOpen: boolean;
}) {
	const question = pendingQuestion(session);
	return (
		<>
			<Box sx={question ? questionTerminalSx : terminalSx}>
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
			{question ? (
				<PhoneSessionQuestion
					key={question.requestId}
					sessionId={session.id}
					question={question}
					socket={socket}
					keyboardOpen={keyboardOpen}
				/>
			) : (
				<PhoneInputDock
					waiting={displayStatus(session) === "waiting"}
					keyboardOpen={keyboardOpen}
					onKey={io.onKey}
					onSend={io.onSend}
				/>
			)}
		</>
	);
}
