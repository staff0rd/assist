import type { WsDispatch } from "./WsDispatch";

export function handleCreated(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const sessionId = msg.sessionId as string;
	d.resolvePendingLaunch();
	// why: creating/resuming switches the pane back to the live terminal
	d.setViewingTranscriptSessionId(null);
	d.setActiveId(sessionId);
	// why: toast only on a genuinely new spawn, not a resume
	if (msg.isNew) d.setSuccess({ message: "New session started", sessionId });
}
