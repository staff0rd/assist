import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { TransferDeps } from "./TransferDeps";
import { transferSession } from "./transferSession";

export function runQueuedTransfer(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
): Promise<void> | undefined {
	const queued = s.transfer?.queued;
	if (!s.transfer || !queued || s.status === "running") return undefined;
	const { target } = s.transfer;
	daemonLog(
		`session ${s.id} went ${s.status}; running queued transfer to ${target}`,
	);
	s.transfer = undefined;
	return transferSession(client, deps, {
		sessionId: s.id,
		target,
		cwd: queued.cwd,
	});
}
