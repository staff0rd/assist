import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { TransferDeps } from "./TransferDeps";
import { transferSession } from "./transferSession";

export function runQueuedTransfer(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
	phaseEnded = false,
): Promise<void> | undefined {
	const queued = s.transfer?.queued;
	if (!s.transfer || !queued || (s.status === "running" && !phaseEnded))
		return undefined;
	const { target } = s.transfer;
	daemonLog(
		`session ${s.id} ${phaseEnded ? "workflow phase ended" : `went ${s.status}`}; running queued transfer to ${target}`,
	);
	s.transfer = undefined;
	return transferSession(client, deps, {
		sessionId: s.id,
		target,
		cwd: queued.cwd,
		phaseEnded,
	});
}
