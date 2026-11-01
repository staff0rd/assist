import { type SessionClient, sendTo } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";

export function queueTransfer(
	client: SessionClient,
	notify: () => void,
	s: Session,
	target: string,
	cwd: string | undefined,
): void {
	daemonLog(
		`session ${s.id} transfer to ${target} queued: agent mid-turn, waiting for idle`,
	);
	s.transfer = { target, queued: { cwd } };
	notify();
	sendTo(client, {
		type: "notice",
		message: `Transfer to ${target} will start once the agent is idle`,
	});
}
