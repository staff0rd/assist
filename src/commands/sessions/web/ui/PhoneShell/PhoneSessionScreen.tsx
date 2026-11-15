import type { SessionSocket } from "../useSessionSocket";
import { sessionTitle } from "../App/sessionTitle";
import { PhoneMoreButton } from "./PhoneActions/PhoneMoreButton";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneReconnectingBar } from "./PhoneReconnectingBar";
import { PhoneSessionBody } from "./PhoneSessionBody";
import { PhoneStatusStrip } from "./PhoneStatusStrip";
import { useOpenPhoneSession } from "./useOpenPhoneSession";
import { usePhoneSessionIo } from "./usePhoneSessionIo";

export function PhoneSessionScreen({
	socket,
	keyboardOpen,
}: {
	socket: SessionSocket;
	keyboardOpen: boolean;
}) {
	const session = useOpenPhoneSession(socket);
	const io = usePhoneSessionIo(session, socket);
	const reconnectingBar = socket.reconnecting && <PhoneReconnectingBar />;
	if (!session) {
		return (
			<>
				<PhoneNavBar left={<PhoneBackButton />} title="Session" />
				{reconnectingBar}
			</>
		);
	}

	return (
		<>
			<PhoneNavBar
				leadingTitle
				left={<PhoneBackButton />}
				title={sessionTitle(session)}
				right={<PhoneMoreButton session={session} />}
			/>
			{reconnectingBar}
			<PhoneStatusStrip session={session} localNode={socket.nodes?.local} />
			<PhoneSessionBody
				session={session}
				socket={socket}
				io={io}
				keyboardOpen={keyboardOpen}
			/>
		</>
	);
}
