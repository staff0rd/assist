import type { SessionInfo } from "../../../../types";

const ENDED = new Set(["done", "stopped", "error"]);

export function sdkComposerState(session: SessionInfo) {
	const running = session.status === "running";
	const live = !ENDED.has(session.status);
	return {
		running,
		live,
		stopping: running && Boolean(session.sdkInterrupting),
		placeholder: !live
			? "This session has ended"
			: running
				? "Message Claude… (queues until this turn ends)"
				: "Message Claude…",
	};
}
