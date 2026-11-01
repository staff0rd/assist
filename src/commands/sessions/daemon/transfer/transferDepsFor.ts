import type { Session } from "../createSession";
import type { TransferDeps } from "./TransferDeps";

export type TransferHost = {
	session: TransferDeps["session"];
	links: TransferDeps["links"];
	stopSession: (id: string) => void;
	discardSession: (id: string) => void;
	update: (mutate: (sessions: Map<string, Session>) => boolean) => void;
};

export function transferDepsFor(m: TransferHost): TransferDeps {
	return {
		session: m.session,
		links: m.links,
		stop: (id) => m.stopSession(id),
		discard: m.discardSession,
		notify: () => m.update(() => true),
	};
}
