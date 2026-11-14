import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { activityLine } from "./activityLine";
import { commandActivityLine } from "./commandActivityLine";

type ToolInput = { command?: unknown; description?: unknown };

/* why: a background shell task's description is its raw command, so the Bash
 * call that started it is remembered to label the task with Claude's own
 * description of that call. */
export function createSdkBackgroundTasks() {
	const described = new Map<string, string>();
	const remember = (message: SDKMessage) => {
		if (message.type !== "assistant") return;
		for (const block of message.message.content) {
			if (block.type !== "tool_use") continue;
			const { command, description } = (block.input ?? {}) as ToolInput;
			if (typeof command === "string" && typeof description === "string")
				described.set(command.trim(), description);
		}
	};
	const label = (description: string) => {
		const known = described.get(description.trim());
		return known ? activityLine(known) : commandActivityLine(description);
	};
	return (message: SDKMessage): string[] | undefined => {
		remember(message);
		if (
			message.type !== "system" ||
			message.subtype !== "background_tasks_changed"
		)
			return undefined;
		return message.tasks
			.filter((task) => !task.ambient)
			.map((task) => label(task.description));
	};
}
