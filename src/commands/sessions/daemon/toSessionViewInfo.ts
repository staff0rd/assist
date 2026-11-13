import type { Session } from "./createSession";

export function toSessionViewInfo({
	lastUserMessage,
	lastAssistantMessage,
	cols,
	rows,
	activeViewer,
	activeViewerNode,
	transfer,
	pty,
	sdkActivity,
	sdkQueued,
	sdkInterrupting,
	sdkResuming,
}: Session) {
	return {
		sdk: pty?.sdk ? true : undefined,
		sdkActivity,
		sdkQueued,
		sdkInterrupting,
		sdkResuming,
		transfer,
		lastUserMessage,
		lastAssistantMessage,
		cols,
		rows,
		activeViewer,
		activeViewerNode,
	};
}
