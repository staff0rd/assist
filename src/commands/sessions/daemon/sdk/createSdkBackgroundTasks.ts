import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

const TOOL_BY_TASK_TYPE: Record<string, string> = {
	local_bash: "Bash",
	local_agent: "Agent",
	local_workflow: "Workflow",
	monitor: "Monitor",
};

export function createSdkBackgroundTasks() {
	return (message: SDKMessage): string[] | undefined => {
		if (
			message.type !== "system" ||
			message.subtype !== "background_tasks_changed"
		)
			return undefined;
		return message.tasks
			.filter((task) => !task.ambient)
			.map((task) => TOOL_BY_TASK_TYPE[task.task_type] ?? task.task_type);
	};
}
