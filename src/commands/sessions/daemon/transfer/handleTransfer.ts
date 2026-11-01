import { daemonLog } from "../daemonLog";
import { routed } from "../routed";
import { transferSession } from "./transferSession";

export const handleTransfer = routed((client, m, d) => {
	daemonLog(`transfer received: id=${d.sessionId} target=${d.target}`);
	void transferSession(
		client,
		{
			session: m.session,
			links: m.links,
			stop: (id) => m.stopSession(id),
			discard: m.discardSession,
			notify: () => m.update(() => true),
		},
		{
			sessionId: d.sessionId as string,
			target: d.target as string,
			cwd: d.cwd as string | undefined,
		},
	);
});
