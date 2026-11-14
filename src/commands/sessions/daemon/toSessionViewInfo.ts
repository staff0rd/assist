import type { Session } from "./createSession";

export function toSessionViewInfo({
	lastUserMessage,
	lastAssistantMessage,
	lastEchoAt,
	cols,
	rows,
	activeViewer,
	activeViewerNode,
	transfer,
	pty,
	sdkActivity,
	sdkActivityElapsed,
	sdkQueued,
	sdkBackgroundTasks,
	sdkInterrupting,
	sdkResuming,
}: Session) {
	return {
		sdk: pty?.sdk ? true : undefined,
		sdkActivity,
		sdkActivityElapsed,
		sdkQueued,
		sdkBackgroundTasks,
		sdkInterrupting,
		sdkResuming,
		transfer,
		lastUserMessage,
		lastAssistantMessage,
		lastEchoAt,
		cols,
		rows,
		activeViewer,
		activeViewerNode,
	};
}
