import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { pendingPreviewConflict } from "./pendingPreviewConflict";
import type { Session } from "./types";

type Msg = Record<string, unknown>;

function refusal(d: Msg, label: string | undefined, conflict: string) {
	if (label !== undefined)
		return {
			log: `defer-command ${label} refused: session ${d.sessionId} has a pending preview (${conflict})`,
			reply: {
				type: "defer-command-result",
				accepted: false,
				pendingPreview: conflict,
			},
		};
	return {
		log: `pr-preview refused: id=${d.sessionId} requestId=${d.requestId} key=${d.previewKey} pending=${conflict}`,
		reply: {
			type: "pr-preview-pending",
			requestId: d.requestId,
			pending: conflict,
		},
	};
}

/** Refuses `d` when another command's preview is pending. Pass the deferred
 * command's label for a `defer-command`, or omit it for a `pr-preview`. */
export function refuseConflictingPreview(
	session: Session,
	client: SessionClient,
	d: Msg,
	label?: string,
): boolean {
	const previewKey =
		typeof d.previewKey === "string" ? d.previewKey : undefined;
	const conflict = pendingPreviewConflict(session, previewKey);
	if (conflict === undefined) return false;
	const { log, reply } = refusal(d, label, conflict);
	daemonLog(log);
	sendTo(client, reply);
	return true;
}
