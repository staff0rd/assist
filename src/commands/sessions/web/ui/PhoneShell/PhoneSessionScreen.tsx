import { useParams } from "react-router";
import { repoLabel } from "../App/repoLabel";
import { sessionTitle } from "../App/sessionTitle";
import { displayStatus } from "../displayStatus";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneInputDock } from "./PhoneInputDock";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneReconnectingBar } from "./PhoneReconnectingBar";
import { PhoneSessionGone } from "./PhoneSessionGone";
import { PhoneStatusStrip } from "./PhoneStatusStrip";
import { PhoneTerminal } from "./PhoneTerminal";
import { usePhoneSessionIo } from "./usePhoneSessionIo";

export function PhoneSessionScreen({
	socket,
	keyboardOpen,
}: {
	socket: SessionSocket;
	keyboardOpen: boolean;
}) {
	const { id } = useParams();
	const session = socket.sessions.find((s) => s.id === id);
	const io = usePhoneSessionIo(session, socket);
	if (!session) return <PhoneSessionGone />;

	const localNode = socket.nodes?.local;
	const subtitle = [repoLabel(session.cwd), session.node ?? localNode]
		.filter(Boolean)
		.join(" · ");

	return (
		<>
			<PhoneNavBar
				left={<PhoneBackButton label="Sessions" to="/" />}
				title={sessionTitle(session)}
				subtitle={subtitle}
			/>
			{socket.reconnecting && <PhoneReconnectingBar />}
			<PhoneStatusStrip session={session} localNode={localNode} />
			<PhoneTerminal
				key={session.id}
				sessionId={session.id}
				cols={session.cols}
				rows={session.rows}
				onOutput={socket.onOutput}
				sendSize={io.sendSize}
				reclaimRef={io.reclaimRef}
			/>
			<PhoneInputDock
				waiting={displayStatus(session) === "waiting"}
				keyboardOpen={keyboardOpen}
				onKey={io.onKey}
				onSend={io.onSend}
			/>
		</>
	);
}
