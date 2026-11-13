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
}: Session) {
	return {
		sdk: pty?.sdk ? true : undefined,
		sdkActivity,
		transfer,
		lastUserMessage,
		lastAssistantMessage,
		cols,
		rows,
		activeViewer,
		activeViewerNode,
	};
}
