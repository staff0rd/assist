import { useParams } from "react-router";
import { sessionTitle } from "../App/sessionTitle";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneMoreButton } from "./PhoneActions/PhoneMoreButton";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneReconnectingBar } from "./PhoneReconnectingBar";
import { PhoneSessionBody } from "./PhoneSessionBody";
import { PhoneSessionGone } from "./PhoneSessionGone";
import { PhoneStatusStrip } from "./PhoneStatusStrip";
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

	return (
		<>
			<PhoneNavBar
				leadingTitle
				left={<PhoneBackButton label="Sessions" to="/" />}
				title={sessionTitle(session)}
				right={<PhoneMoreButton session={session} />}
			/>
			{socket.reconnecting && <PhoneReconnectingBar />}
			<PhoneStatusStrip session={session} localNode={localNode} />
			<PhoneSessionBody
				session={session}
				socket={socket}
				io={io}
				keyboardOpen={keyboardOpen}
			/>
		</>
	);
}
