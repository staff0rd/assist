import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";

export function splitAutopilotItems(items: AutopilotItemView[]) {
	const isRunning = (item: AutopilotItemView) =>
		item.sessionId !== null &&
		item.status !== "done" &&
		item.status !== "wontdo";
	return {
		running: items.filter(isRunning),
		delivered: items.filter((item) => !isRunning(item)),
	};
}
