import type { SessionInfo } from "../../types";
import { ApiNodeContext } from "../../useApiNode";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneLifecycleGroup } from "./PhoneLifecycleGroup";
import { PhonePrActions } from "./PhonePrActions";
import { PhoneStarGroup } from "./PhoneStarGroup";
import { PhoneToggleGroup } from "./PhoneToggleGroup";

type Props = {
	session: SessionInfo;
	socket: SessionSocket;
	linkedNode: string | undefined;
	onClose: () => void;
	onConfirmEnd: () => void;
};

export function PhoneSessionActions({
	session,
	socket,
	linkedNode,
	onClose,
	onConfirmEnd,
}: Props) {
	return (
		<>
			<PhoneStarGroup session={session} onDone={onClose} />
			<PhoneToggleGroup session={session} socket={socket} />
			<ApiNodeContext.Provider value={linkedNode}>
				<PhonePrActions
					session={session}
					node={linkedNode}
					launchAssist={socket.createAssistSession}
					onDone={onClose}
				/>
			</ApiNodeContext.Provider>
			<PhoneLifecycleGroup
				session={session}
				socket={socket}
				onDone={onClose}
				onConfirmEnd={onConfirmEnd}
			/>
		</>
	);
}
