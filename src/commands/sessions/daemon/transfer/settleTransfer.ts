import { type SessionClient, sendTo } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { LaunchOutcome } from "./launchOnTarget";
import type { TransferDeps } from "./TransferDeps";

export function settleTransfer(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
	outcome: LaunchOutcome,
	traceId: string,
): void {
	const target = s.transfer?.target ?? "target";
	if (!outcome.ok) {
		daemonLog(
			`session ${s.id} transfer to ${target} failed trace=${traceId}: ${outcome.error}; source kept`,
		);
		s.transfer = { target, error: outcome.error };
		deps.notify();
		sendTo(client, {
			type: "error",
			message: `Transfer to ${target} failed: ${outcome.error}`,
		});
		return;
	}
	daemonLog(
		`session ${s.id} transferred to ${target} as ${outcome.sessionId} trace=${traceId}; closing source`,
	);
	s.transfer = undefined;
	// why: the UI must see the hand-off while the source is still listed, so it can tell whether the source was selected
	sendTo(client, {
		type: "notice",
		message: `Transferred to ${target}`,
		transfer: { sourceId: s.id, sessionId: outcome.sessionId, node: target },
	});
	deps.stop(s.id);
	deps.discard(s.id);
}
