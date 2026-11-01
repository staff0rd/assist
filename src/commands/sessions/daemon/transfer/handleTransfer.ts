import { daemonLog } from "../daemonLog";
import { routed } from "../routed";
import { cancelQueuedTransfer } from "./cancelQueuedTransfer";
import { transferDepsFor } from "./transferDepsFor";
import { transferSession } from "./transferSession";

export const handleTransfer = routed((client, m, d) => {
	daemonLog(`transfer received: id=${d.sessionId} target=${d.target}`);
	void transferSession(client, transferDepsFor(m), {
		sessionId: d.sessionId as string,
		target: d.target as string,
		cwd: d.cwd as string | undefined,
	});
});

export const handleCancelTransfer = routed((_client, m, d) => {
	const id = d.sessionId as string;
	daemonLog(`cancel-transfer received: id=${id}`);
	m.update(() => cancelQueuedTransfer(m.session(id), id));
});
