import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { activityLine } from "./activityLine";

export function sdkBackgroundTasks(message: SDKMessage): string[] | undefined {
	if (
		message.type !== "system" ||
		message.subtype !== "background_tasks_changed"
	)
		return undefined;
	return message.tasks
		.filter((task) => !task.ambient)
		.map((task) => activityLine(task.description));
}
