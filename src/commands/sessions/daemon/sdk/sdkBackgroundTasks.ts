import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export function sdkBackgroundTasks(message: SDKMessage): string[] | undefined {
	if (
		message.type !== "system" ||
		message.subtype !== "background_tasks_changed"
	)
		return undefined;
	return message.tasks
		.filter((task) => !task.ambient)
		.map((task) => task.description);
}
