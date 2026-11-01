import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";

export type TransferDeps = {
	session: (id: string) => Session | undefined;
	links: {
		localNode: () => string;
		isConnected: (node: string) => boolean;
		route: (client: SessionClient, data: Record<string, unknown>) => boolean;
	};
	stop: (id: string) => void;
	dismiss: (id: string) => void;
	notify: () => void;
};
