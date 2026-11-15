import type { ReactNode } from "react";
import type { SessionSocket } from "../../../../useSessionSocket";
import { QueuedMessageProviders } from "./QueuedMessageProviders";

export function SocketShellProviders({
	socket,
	children,
}: {
	socket: SessionSocket;
	children: ReactNode;
}) {
	return (
		<QueuedMessageProviders
			dequeue={socket.dequeueMessage}
			runShell={socket.runShellCommand}
			stopShell={socket.stopShellCommand}
			discardShell={socket.discardShellResult}
		>
			{children}
		</QueuedMessageProviders>
	);
}
