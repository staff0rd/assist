import type { WsDispatch } from "../../../WsDispatch";

export function handleCreated(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const sessionId = msg.sessionId as string;
	const { title, open } = d.resolvePendingLaunch();
	const staysInBackground = msg.isNew && !open && d.getActiveId() !== null;
	if (!staysInBackground) {
		// why: creating/resuming switches the pane back to the live terminal
		d.setViewingTranscriptSessionId(null);
		d.setActiveId(sessionId);
	}
	// why: toast only on a genuinely new spawn, not a resume
	if (msg.isNew)
		d.setSuccess({
			message: title ? `Started ${title}` : "New session started",
			sessionId,
		});
}
