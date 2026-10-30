import { useParams } from "react-router";
import { pasteAndSubmit } from "../../../shared/pasteAndSubmit";
import { repoLabel } from "../App/repoLabel";
import { sessionTitle } from "../App/sessionTitle";
import { displayStatus } from "../displayStatus";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneInputDock } from "./PhoneInputDock";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneSessionGone } from "./PhoneSessionGone";
import { PhoneStatusStrip } from "./PhoneStatusStrip";
import { PhoneTerminal } from "./PhoneTerminal";

export function PhoneSessionScreen({
	socket,
	keyboardOpen,
}: {
	socket: SessionSocket;
	keyboardOpen: boolean;
}) {
	const { id } = useParams();
	const session = socket.sessions.find((s) => s.id === id);
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
			<PhoneStatusStrip session={session} localNode={localNode} />
			<PhoneTerminal
				key={session.id}
				sessionId={session.id}
				cols={session.cols}
				rows={session.rows}
				onOutput={socket.onOutput}
			/>
			<PhoneInputDock
				waiting={displayStatus(session) === "waiting"}
				keyboardOpen={keyboardOpen}
				onKey={(data) => socket.sendInput(session.id, data)}
				onSend={(text) => pasteAndSubmit(socket.sendInput, session.id, text)}
			/>
		</>
	);
}
