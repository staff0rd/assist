import type { ReactNode } from "react";
import type { SessionSocket } from "../../useSessionSocket";
import { usePhoneAutopilot } from "./usePhoneAutopilot";
import { PhoneAutopilotContext } from "./usePhoneAutopilotContext";

export function PhoneAutopilotProvider({
	socket,
	children,
}: {
	socket: SessionSocket;
	children: ReactNode;
}) {
	const autopilot = usePhoneAutopilot(socket);
	return (
		<PhoneAutopilotContext.Provider value={autopilot}>
			{children}
		</PhoneAutopilotContext.Provider>
	);
}
