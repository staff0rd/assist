import type { SessionInfo } from "../../../../types";

const ENDED = new Set(["done", "stopped", "error"]);

function placeholder(live: boolean, resuming: boolean, running: boolean) {
	if (!live) return "This session has ended";
	if (resuming) return "Resuming conversation…";
	if (running) return "Message Claude… (queues until this turn ends)";
	return "Message Claude…";
}

export function sdkComposerState(session: SessionInfo) {
	const running = session.status === "running";
	const live = !ENDED.has(session.status);
	const resuming = live && Boolean(session.sdkResuming);
	const waiting = session.status === "waiting" && !resuming;
	return {
		running,
		live,
		resuming,
		enabled: live && !resuming,
		stopping: running && Boolean(session.sdkInterrupting),
		placeholder: placeholder(live, resuming, running),
		suggestion: waiting ? session.sdkPromptSuggestion : undefined,
	};
}
