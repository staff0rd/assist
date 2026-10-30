import type { Session } from "./createSession";

export function toSessionViewInfo({
	lastUserMessage,
	lastAssistantMessage,
	cols,
	rows,
	activeViewer,
	activeViewerNode,
}: Session) {
	return {
		lastUserMessage,
		lastAssistantMessage,
		cols,
		rows,
		activeViewer,
		activeViewerNode,
	};
}
